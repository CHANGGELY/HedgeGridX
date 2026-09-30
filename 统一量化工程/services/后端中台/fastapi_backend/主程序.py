import asyncio
import contextlib
import json
import os
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from typing import List, Literal, Optional

import uvicorn
from fastapi import BackgroundTasks, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .设置 import 配置


# =============================
# 数据模型（类名中文，字段保持英文，避免前端破坏）
# =============================
class K线(BaseModel):
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: float
    quote_volume: float


class K线响应(BaseModel):
    success: bool
    symbol: str
    start_date: str
    end_date: str
    timeframe: Literal["1m", "1h", "1d", "1M"]
    count: int
    klines: List[K线]
    source: str


class 回测参数(BaseModel):
    symbol: str
    startDate: str
    endDate: str
    initialCapital: float
    leverage: int
    bidSpread: Optional[float] = 0.002
    askSpread: Optional[float] = 0.002
    positionSizeRatio: Optional[float] = 0.02
    maxPositionRatio: Optional[float] = 0.8
    orderRefreshTime: Optional[float] = 30.0
    useDynamicOrderSize: Optional[bool] = True
    minOrderAmount: Optional[float] = 0.008
    maxOrderAmount: Optional[float] = 99.0
    positionStopLoss: Optional[float] = 0.05
    enablePositionStopLoss: Optional[bool] = False
    positionMode: Optional[str] = "Hedge"
    makerFee: Optional[float] = 0.0002
    takerFee: Optional[float] = 0.0005
    useFeeRebate: Optional[bool] = True
    rebateRate: Optional[float] = 0.30


class 进度响应(BaseModel):
    progress: float
    message: str
    result: Optional[dict] = None
    error: Optional[str] = None
    logs: Optional[List[str]] = None


# =============================
# 应用与静态资源
# =============================
应用 = FastAPI(title="回测接口", version="0.2.0")
静态目录 = Path(__file__).parent / "static"
try:
    应用.mount("/static", StaticFiles(directory=str(静态目录)), name="static")
    # 中文别名，不移除英文路径
    应用.mount("/静态", StaticFiles(directory=str(静态目录)), name="静态")
except Exception:
    pass


@应用.get("/")
@应用.get("/首页")
def 首页():
    首页文件 = 静态目录 / "index.html"
    if 首页文件.exists():
        return FileResponse(首页文件)
    return JSONResponse({"status": "ok", "message": "index.html not found"})


# 为浏览器默认的 /favicon.ico 提供站点图标，避免 404
@应用.get("/favicon.ico")
def 站点图标():
    svg = (
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>"
        "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>"
        "<stop offset='0%' stop-color='#1f77b4'/><stop offset='100%' stop-color='#2ca02c'/></linearGradient></defs>"
        "<rect x='0' y='0' width='64' height='64' rx='12' fill='url(#g)'/>"
        "<g fill='white' stroke='white' stroke-width='2'>"
        "<path d='M14 40 L26 28 L34 36 L50 20' fill='none'/>"
        "<circle cx='26' cy='28' r='2'/><circle cx='34' cy='36' r='2'/><circle cx='50' cy='20' r='2'/><circle cx='14' cy='40' r='2'/>"
        "</g>"
        "</svg>"
    )
    return Response(content=svg, media_type="image/svg+xml")


# =============================
# 运行态对象
# =============================
正在运行的回测任务: Optional[asyncio.Task] = None
活跃WebSocket会话: set = set()


# 原子写入 JSON，避免并发读取时出现 JSONDecodeError
def _安全写入_json(路径: Path, 数据: dict):
    try:
        路径.parent.mkdir(parents=True, exist_ok=True)
        临时 = 路径.with_suffix(路径.suffix + ".tmp")
        with open(临时, "w", encoding="utf-8") as f:
            json.dump(数据, f, ensure_ascii=False, indent=2)
            try:
                f.flush()
                os.fsync(f.fileno())
            except Exception:
                pass
        os.replace(临时, 路径)
    except Exception:
        # 兜底：退回到直接写（极端情况下依然可用）
        with open(路径, "w", encoding="utf-8") as f:
            json.dump(数据, f, ensure_ascii=False, indent=2)


# =============================
# 工具函数：稳健提取JSON对象
# =============================
def _尝试解析JSON(文本: str):
    """尝试从可能夹杂日志的文本中提取并解析JSON对象。
    1) 直接整体解析
    2) 截取第一个"{"到最后一个"}"之间的片段解析
    3) 通过括号配对提取最后一个完整JSON对象
    返回 dict 或 None。
    """
    try:
        return json.loads(文本)
    except Exception:
        pass
    # 方式2：first "{" 到 last "}"
    try:
        s = 文本.find("{")
        e = 文本.rfind("}")
        if s != -1 and e != -1 and e > s:
            片段 = 文本[s : e + 1]
            return json.loads(片段)
    except Exception:
        pass
    # 方式3：括号配对，提取最后一个完整对象
    try:
        栈 = 0
        start = -1
        候选 = None
        for i, ch in enumerate(文本):
            if ch == "{":
                if 栈 == 0:
                    start = i
                栈 += 1
            elif ch == "}":
                if 栈 > 0:
                    栈 -= 1
                    if 栈 == 0 and start != -1:
                        候选 = 文本[start : i + 1]
        if 候选:
            return json.loads(候选)
    except Exception:
        pass
    return None


# =============================
# 健康与进度
# =============================
@应用.get("/health")
@应用.get("/健康")
def 健康():
    return {"status": "ok"}

# 直接获取最终结果（前端兜底使用）
@应用.get("/result")
def 获取结果():
    try:
        结果文件 = 配置.缓存目录 / "last_result.json"
        if 结果文件.exists():
            with open(结果文件, "r", encoding="utf-8") as f:
                数据 = json.load(f)
            return JSONResponse({"success": True, "result": 数据})
        # 兜底：尝试从 progress.json 的 logs 重建
        进度文件 = 配置.缓存目录 / "progress.json"
        if 进度文件.exists():
            文本 = 进度文件.read_text(encoding="utf-8", errors="ignore")
            解析 = _尝试解析JSON(文本)
            if isinstance(解析, dict):
                return JSONResponse({"success": True, "result": 解析})
        raise FileNotFoundError("结果不存在，请稍后重试")
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=404)


@应用.get("/progress", response_model=进度响应)
@应用.get("/进度", response_model=进度响应)
def 获取进度():
    # 多路径容错：优先 settings.cache，其次以项目根为基准的 cache 目录
    primary = 配置.缓存目录 / "progress.json"
    project_root = Path(__file__).parent.parent.resolve()
    secondary = project_root / "cache" / "progress.json"
    进度文件 = primary if primary.exists() else secondary if secondary.exists() else None
    if 进度文件 is None or not 进度文件.exists():
        # 容错：尝试在项目根下递归查找 cache/progress.json
        try:
            for p in project_root.rglob("progress.json"):
                if str(p).lower().endswith("cache\\progress.json") or str(p).lower().endswith("cache/progress.json"):
                    进度文件 = p
                    break
        except Exception:
            pass
    if 进度文件 is None or not 进度文件.exists():
        # 尝试直接返回最终结果（若已存在）
        try:
            结果文件 = 配置.缓存目录 / "last_result.json"
            if 结果文件.exists():
                with open(结果文件, "r", encoding="utf-8") as rf:
                    最终 = json.load(rf)
                return 进度响应(progress=100.0, message="回测完成", result=最终, error=None, logs=[])
        except Exception:
            pass
        return 进度响应(progress=0, message="等待中...", result=None, error=None, logs=[])
    try:
        # 优先正常解析
        with open(进度文件, "r", encoding="utf-8") as f:
            数据 = json.load(f)
    except Exception:
        # 回退：宽松解析，尽最大努力从文本中提取最后一个完整 JSON
        try:
            原文 = 进度文件.read_text(encoding="utf-8", errors="ignore")
            数据 = _尝试解析JSON(原文) or {}
        except Exception as e2:
            return 进度响应(progress=0, message=f"获取进度失败: {str(e2)}")
    # 若结果缺失，尝试读取缓存的最终结果文件
    try:
        if not 数据.get("result"):
            # 兜底1：尝试从日志重建 JSON
            日志列表 = 数据.get("logs")
            if isinstance(日志列表, list) and 日志列表:
                拼接 = "\n".join(str(x) for x in 日志列表 if x)
                解析 = _尝试解析JSON(拼接)
                if isinstance(解析, dict):
                    数据["result"] = 解析
            # 兜底2：读取缓存的最终结果文件
            if not 数据.get("result"):
                结果文件 = 配置.缓存目录 / "last_result.json"
                if 结果文件.exists():
                    with open(结果文件, "r", encoding="utf-8") as rf:
                        数据["result"] = json.load(rf)
            if 数据.get("result"):
                数据["progress"] = max(float(数据.get("progress", 0) or 0), 100.0)
                数据["message"] = "回测完成"
    except Exception:
        pass
    try:
        return 进度响应(
            progress=float(数据.get("progress", 0) or 0),
            message=str(数据.get("message", "等待中...")),
            result=数据.get("result"),
            error=数据.get("error"),
            logs=数据.get("logs", []) or [],
        )
    except Exception as e:
        return 进度响应(progress=0, message=f"获取进度失败: {str(e)}")


# =============================
# K线数据（参数化 + 缓存）
# =============================
@应用.get("/klines", response_model=K线响应)
@应用.get("/K线", response_model=K线响应)
def 获取K线(
    symbol: str, start_date: str, end_date: str, timeframe: Literal["1m", "1h", "1d", "1M"] = "1m"
):
    try:
        import pickle

        import pandas as pd

        数据目录 = 配置.数据目录
        候选文件 = list(数据目录.glob(f"{symbol}_1m_*.h5"))
        if 候选文件:
            数据文件 = 候选文件[0]
        else:
            数据文件 = 数据目录 / "ETHUSDT_1m_2019-11-01_to_2025-06-15.h5"

        缓存目录 = 配置.缓存目录 / "klines" / symbol
        缓存目录.mkdir(parents=True, exist_ok=True)
        周期缓存名 = {
            "1m": f"{symbol}_1m_processed.pkl",
            "1h": f"{symbol}_1h_processed.pkl",
            "1d": f"{symbol}_1d_processed.pkl",
            "1M": f"{symbol}_1M_processed.pkl",
        }

        # 先用周期缓存（再按时间过滤）
        缓存文件 = 缓存目录 / 周期缓存名.get(timeframe, "")
        if 缓存文件.exists():
            with open(缓存文件, "rb") as f:
                缓存数据 = pickle.load(f)
            起始 = int(pd.to_datetime(start_date).timestamp())
            结束 = int(pd.to_datetime(end_date).timestamp())
            过滤后 = [k for k in 缓存数据 if 起始 <= k["time"] <= 结束]
            for k in 过滤后:
                k["timestamp"] = k["time"]
                k["quote_volume"] = k["volume"] * k["close"]
            return K线响应(
                success=True,
                symbol=symbol,
                start_date=start_date,
                end_date=end_date,
                timeframe=timeframe,
                count=len(过滤后),
                klines=[
                    K线(
                        **{
                            "timestamp": k["timestamp"],
                            "open": k["open"],
                            "high": k["high"],
                            "low": k["low"],
                            "close": k["close"],
                            "volume": k["volume"],
                            "quote_volume": k["quote_volume"],
                        }
                    )
                    for k in 过滤后
                ],
                source="cache",
            )

        # 缓存不存在，读取源数据
        if not 数据文件.exists():
            raise HTTPException(status_code=404, detail=f"数据文件不存在: {数据文件}")
        df = pd.read_hdf(数据文件, key="klines")
        起始 = int(pd.to_datetime(start_date).timestamp())
        结束 = int(pd.to_datetime(end_date).timestamp())
        if df["timestamp"].dtype == "datetime64[ns]":
            df["timestamp"] = df["timestamp"].astype("int64") // 10**9
        掩码 = (df["timestamp"] >= 起始) & (df["timestamp"] <= 结束)
        子集 = df[掩码].copy()
        if len(子集) == 0:
            raise HTTPException(
                status_code=400, detail=f"指定时间范围内没有数据: {start_date} 到 {end_date}"
            )
        if timeframe != "1m":
            规则映射 = {"1h": "1h", "1d": "1D", "1M": "1M"}
            子集["datetime"] = pd.to_datetime(子集["timestamp"], unit="s")
            子集.set_index("datetime", inplace=True)
            重采样 = (
                子集.resample(规则映射[timeframe])
                .agg(
                    {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}
                )
                .dropna()
                .reset_index()
            )
            重采样["timestamp"] = 重采样["datetime"].astype("int64") // 10**9
            子集 = 重采样
        序列 = []
        for _, 行 in 子集.iterrows():
            成交额 = 行.get("quote_volume", 行["volume"] * 行["close"])
            序列.append(
                K线(
                    timestamp=int(行["timestamp"]),
                    open=float(行["open"]),
                    high=float(行["high"]),
                    low=float(行["low"]),
                    close=float(行["close"]),
                    volume=float(行["volume"]),
                    quote_volume=float(成交额),
                )
            )
        return K线响应(
            success=True,
            symbol=symbol,
            start_date=start_date,
            end_date=end_date,
            timeframe=timeframe,
            count=len(序列),
            klines=序列,
            source="realtime",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


# =============================
# 回测（异步子进程 + 进度文件）
# =============================
@应用.post("/backtest")
@应用.post("/回测")
async def 启动回测(参数: 回测参数, 后台任务: BackgroundTasks):
    global 正在运行的回测任务
    if 正在运行的回测任务 and not 正在运行的回测任务.done():
        raise HTTPException(status_code=409, detail="已有回测正在运行，请等待完成")

    # 临时参数文件
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8") as f:
        回测参数字典 = {
            "symbol": 参数.symbol,
            "startDate": 参数.startDate,
            "endDate": 参数.endDate,
            "initialCapital": 参数.initialCapital,
            "leverage": 参数.leverage,
            "bidSpread": 参数.bidSpread,
            "askSpread": 参数.askSpread,
            "positionSizeRatio": 参数.positionSizeRatio,
            "maxPositionRatio": 参数.maxPositionRatio,
            "orderRefreshTime": 参数.orderRefreshTime,
            "useDynamicOrderSize": 参数.useDynamicOrderSize,
            "minOrderAmount": 参数.minOrderAmount,
            "maxOrderAmount": 参数.maxOrderAmount,
            "positionStopLoss": 参数.positionStopLoss,
            "enablePositionStopLoss": 参数.enablePositionStopLoss,
            "positionMode": 参数.positionMode,
            "makerFee": 参数.makerFee,
            "takerFee": 参数.takerFee,
            "useFeeRebate": 参数.useFeeRebate,
            "rebateRate": 参数.rebateRate,
        }
        json.dump(回测参数字典, f, ensure_ascii=False, indent=2)
        参数文件路径 = f.name

    # 初始化进度
    进度文件 = 配置.缓存目录 / "progress.json"
    _安全写入_json(进度文件, {"progress": 0, "message": "准备回测参数..."})

    # 启动异步任务
    正在运行的回测任务 = asyncio.create_task(_执行回测子进程(参数文件路径, 后台任务))
    return {"status": "accepted", "message": "回测已启动，请通过/progress查询进度"}


async def _执行回测子进程(参数文件路径: str, 后台任务: BackgroundTasks):
    输出文件路径 = None
    try:
        项目根 = Path(__file__).parent.parent
        脚本路径 = 项目根 / "进度回测执行器.py"
        if not 脚本路径.exists():
            raise FileNotFoundError(f"回测执行器不存在: {脚本路径}")
        if not os.path.exists(参数文件路径):
            raise FileNotFoundError(f"参数文件不存在: {参数文件路径}")
        # 结果输出文件（供稳健读取）
        输出文件路径 = str((配置.缓存目录 / "last_result.json").resolve())
        with contextlib.suppress(Exception):
            if os.path.exists(输出文件路径):
                os.unlink(输出文件路径)
        命令 = [
            sys.executable,
            "-X",
            "utf8",
            str(脚本路径),
            "--params-file",
            参数文件路径,
            "--output-file",
            输出文件路径,
        ]
        进程 = await asyncio.create_subprocess_exec(
            *命令, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, cwd=str(项目根)
        )
        # 实时监控 stdout/stderr，将日志与进度写入 progress.json
        stdout_lines: List[str] = []
        stderr_lines: List[str] = []
        监控任务1 = asyncio.create_task(_监控并收集(进程.stdout, "stdout", stdout_lines))
        监控任务2 = asyncio.create_task(_监控并收集(进程.stderr, "stderr", stderr_lines))
        await 进程.wait()
        await asyncio.gather(监控任务1, 监控任务2)

        解析: Optional[dict] = None
        # 首选：从输出文件读取结果
        if 输出文件路径 and os.path.exists(输出文件路径):
            try:
                with open(输出文件路径, "r", encoding="utf-8") as rf:
                    解析 = json.load(rf)
            except Exception:
                解析 = None
        if 解析 is None and 进程.returncode == 0:
            标准输出文本 = "\n".join(stdout_lines)
            解析 = _尝试解析JSON(标准输出文本)

        if 进程.returncode == 0 and 解析 is not None:
            进度数据 = {"progress": 100, "message": "回测完成", "result": 解析}
        elif 进程.returncode == 0 and 解析 is None:
            进度数据 = {
                "progress": 100,
                "message": "回测完成但结果解析失败",
                "error": "结果格式错误",
            }
        else:
            错误文本 = "\n".join(stderr_lines)
            进度数据 = {"progress": 0, "message": f"回测失败: {错误文本}", "error": 错误文本}

        进度文件 = 配置.缓存目录 / "progress.json"
        try:
            # 保留既有日志
            if 进度文件.exists():
                with open(进度文件, "r", encoding="utf-8") as f:
                    现有 = json.load(f)
                if "logs" in 现有:
                    进度数据["logs"] = 现有["logs"]
        except Exception:
            pass
        _安全写入_json(进度文件, 进度数据)
    except Exception as e:
        if isinstance(e, NotImplementedError):
            try:
                项目根 = Path(__file__).parent.parent
                脚本路径 = 项目根 / "进度回测执行器.py"
                命令 = [
                    sys.executable,
                    "-X",
                    "utf8",
                    str(脚本路径),
                    "--params-file",
                    参数文件路径,
                ]
                # 同步子进程 + 线程读取管道
                proc = subprocess.Popen(
                    命令,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=str(项目根),
                    text=True,
                    encoding="utf-8",
                    shell=False,
                )
                stdout_lines: List[str] = []
                stderr_lines: List[str] = []

                def _reader(pipe, buffer):
                    for line in iter(pipe.readline, ""):
                        文本 = line.strip()
                        buffer.append(文本)
                        try:
                            进度文件 = 配置.缓存目录 / "progress.json"
                            数据 = {}
                            if 进度文件.exists():
                                with open(进度文件, "r", encoding="utf-8") as f:
                                    数据 = json.load(f)
                            日志 = 数据.get("logs", [])
                            日志.append(文本)
                            if len(日志) > 200:
                                日志 = 日志[-200:]
                            数据["logs"] = 日志
                            if 文本.startswith("PROGRESS:"):
                                部分 = 文本.split(":")
                                if len(部分) >= 4:
                                    try:
                                        百分比 = float(部分[2].replace("%", ""))
                                        状态 = 部分[3] if len(部分) > 3 else "处理中..."
                                        数据["progress"] = 百分比
                                        数据["message"] = 状态
                                    except (ValueError, IndexError):
                                        pass
                            with open(进度文件, "w", encoding="utf-8") as f:
                                json.dump(数据, f, ensure_ascii=False, indent=2)
                        except Exception:
                            pass
                    pipe.close()

                t1 = threading.Thread(target=_reader, args=(proc.stdout, stdout_lines), daemon=True)
                t2 = threading.Thread(target=_reader, args=(proc.stderr, stderr_lines), daemon=True)
                t1.start()
                t2.start()
                # 等待进程结束
                await asyncio.to_thread(proc.wait)
                t1.join(timeout=1)
                t2.join(timeout=1)

                if proc.returncode == 0:
                    标准输出文本 = "\n".join(stdout_lines)
                    解析 = _尝试解析JSON(标准输出文本)
                    if 解析 is not None:
                        进度数据 = {"progress": 100, "message": "回测完成", "result": 解析}
                    else:
                        进度数据 = {
                            "progress": 100,
                            "message": "回测完成但结果解析失败",
                            "error": "结果格式错误",
                        }
                else:
                    错误文本 = "\n".join(stderr_lines)
                    进度数据 = {
                        "progress": 0,
                        "message": f"回测失败: {错误文本}",
                        "error": 错误文本,
                    }
                进度文件 = 配置.缓存目录 / "progress.json"
                try:
                    if 进度文件.exists():
                        with open(进度文件, "r", encoding="utf-8") as f:
                            现有 = json.load(f)
                        if "logs" in 现有:
                            进度数据["logs"] = 现有["logs"]
                except Exception:
                    pass
                _安全写入_json(进度文件, 进度数据)
                return
            except Exception as ee:
                错误文本 = str(ee) if str(ee) else repr(ee)
                进度数据 = {
                    "progress": 0,
                    "message": f"执行回测时发生错误(同步回退): {错误文本}",
                    "error": 错误文本,
                }
        else:
            错误文本 = str(e) if str(e) else repr(e)
            进度数据 = {
                "progress": 0,
                "message": f"执行回测时发生错误: {错误文本}",
                "error": 错误文本,
            }
        进度文件 = 配置.缓存目录 / "progress.json"
        _安全写入_json(进度文件, 进度数据)
    finally:
        后台任务.add_task(_清理临时文件, 参数文件路径)
        # 不清理 last_result.json，便于调试/前端兜底读取


async def _监控并收集(管道, 源: str, 缓冲: List[str]):
    try:
        while True:
            行 = await 管道.readline()
            if not 行:
                break
            文本 = 行.decode("utf-8", errors="ignore").strip()
            缓冲.append(文本)
            try:
                进度文件 = 配置.缓存目录 / "progress.json"
                数据 = {}
                if 进度文件.exists():
                    with open(进度文件, "r", encoding="utf-8") as f:
                        数据 = json.load(f)
                # 追加日志
                日志 = 数据.get("logs", [])
                日志.append(文本)
                if len(日志) > 200:
                    日志 = 日志[-200:]
                数据["logs"] = 日志
                # 解析进度标签
                if 文本.startswith("PROGRESS:"):
                    部分 = 文本.split(":")
                    if len(部分) >= 4:
                        try:
                            百分比 = float(部分[2].replace("%", ""))
                            状态 = 部分[3] if len(部分) > 3 else "处理中..."
                            数据["progress"] = 百分比
                            数据["message"] = 状态
                        except (ValueError, IndexError):
                            pass
                _安全写入_json(进度文件, 数据)
            except Exception:
                pass
    except Exception:
        pass


def _清理临时文件(文件路径: str):
    try:
        os.unlink(文件路径)
    except Exception:
        pass


# =============================
# WebSocket 推送（无轮询）
# =============================
@应用.websocket("/ws/backtest")
@应用.websocket("/ws/回测")
async def 回测推送(ws: WebSocket):
    await ws.accept()
    活跃WebSocket会话.add(ws)
    try:
        # 接收前端发送的参数
        初始消息 = await ws.receive_json()
        if not isinstance(初始消息, dict):
            await ws.send_json({"type": "error", "error": "参数格式错误"})
            await ws.close()
            return

        # 读取前端“开发者模式”开关（默认 false）
        开发者模式 = bool(
            初始消息.get("devMode")
            or 初始消息.get("dev")
            or 初始消息.get("verbose")
        )

        # 启动子进程执行回测并实时推送（按开发者模式决定是否推送日志）
        await _执行回测子进程_ws(初始消息, ws, dev_mode=开发者模式)
    except WebSocketDisconnect:
        # 客户端断开
        pass
    except Exception as e:
        try:
            错误文本 = str(e) if str(e) else repr(e)
            await ws.send_json({"type": "error", "error": 错误文本})
        except Exception:
            pass
    finally:
        with contextlib.suppress(Exception):
            活跃WebSocket会话.discard(ws)
            await ws.close()


async def _执行回测子进程_ws(参数字典: dict, ws: WebSocket, dev_mode: bool = False):
    """执行回测并通过WebSocket推送进度/结果；仅在 dev_mode 时推送日志"""
    try:
        # 写临时参数文件以复用现有执行器逻辑
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, encoding="utf-8"
        ) as f:
            json.dump(参数字典, f, ensure_ascii=False, indent=2)
            参数文件路径 = f.name

        项目根 = Path(__file__).parent.parent
        脚本路径 = 项目根 / "进度回测执行器.py"
        if not 脚本路径.exists():
            await ws.send_json({"type": "error", "error": f"回测执行器不存在: {脚本路径}"})
            return
        # 结果输出文件（与 HTTP 路径一致，便于兜底）
        输出文件路径 = str((配置.缓存目录 / "last_result.json").resolve())
        with contextlib.suppress(Exception):
            if os.path.exists(输出文件路径):
                os.unlink(输出文件路径)
        命令 = [
            sys.executable,
            "-X",
            "utf8",
            str(脚本路径),
            "--params-file",
            参数文件路径,
            "--output-file",
            输出文件路径,
        ]
        try:
            # 首选：异步子进程（性能更好）
            进程 = await asyncio.create_subprocess_exec(
                *命令,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(项目根),
            )

            stdout_buffer: List[str] = []

            async def 推送管道(管道, 源: str):
                try:
                    while True:
                        行 = await 管道.readline()
                        if not 行:
                            break
                        文本 = 行.decode("utf-8", errors="ignore").strip()
                        if not 文本:
                            continue
                        if 源 == "stdout":
                            # 仅收集 stdout，用于结束后解析 JSON，不向前端转发
                            stdout_buffer.append(文本)
                            continue
                        # 仅从 stderr 推送“进度/告警/错误”，避免刷屏
                        if 文本.startswith("PROGRESS:"):
                            部分 = 文本.split(":")
                            if len(部分) >= 4:
                                try:
                                    百分比 = float(部分[2].replace("%", ""))
                                    状态 = 部分[3] if len(部分) > 3 else "处理中..."
                                    with contextlib.suppress(Exception):
                                        await ws.send_json({"type": "progress", "progress": 百分比, "message": 状态})
                                    # 同步写入进度文件，便于HTTP轮询兜底
                                    try:
                                        进度文件 = 配置.缓存目录 / "progress.json"
                                        数据 = {"progress": 百分比, "message": 状态}
                                        # 尝试保留现有日志
                                        if 进度文件.exists():
                                            with open(进度文件, "r", encoding="utf-8") as f:
                                                旧 = json.load(f)
                                            if "logs" in 旧:
                                                数据["logs"] = 旧["logs"]
                                        _安全写入_json(进度文件, 数据)
                                    except Exception:
                                        pass
                                    continue
                                except (ValueError, IndexError):
                                    pass
                        if dev_mode:
                            低 = 文本.lower()
                            if any(k in 低 for k in ["error", "exception", "failed", "fail ", "warning", "traceback", "错误", "异常", "警告"]):
                                等级 = "warning" if ("warning" in 低 or "警告" in 低) else "error"
                                with contextlib.suppress(Exception):
                                    await ws.send_json({"type": "log", "level": 等级, "text": 文本})
                except Exception:
                    pass

            推送stdout = asyncio.create_task(推送管道(进程.stdout, "stdout"))
            推送stderr = asyncio.create_task(推送管道(进程.stderr, "stderr"))
            await 进程.wait()
            await asyncio.gather(推送stdout, 推送stderr)

            # 结束后解析结果（优先输出文件，其次 stdout JSON）
            解析 = None
            try:
                if 输出文件路径 and os.path.exists(输出文件路径):
                    with open(输出文件路径, "r", encoding="utf-8") as rf:
                        解析 = json.load(rf)
            except Exception:
                解析 = None
            if 解析 is None:
                标准输出文本 = "\n".join(stdout_buffer)
                解析 = _尝试解析JSON(标准输出文本)
            if 解析 is not None:
                await ws.send_json({"type": "result", "result": 解析})
            else:
                await ws.send_json({"type": "error", "error": "结果格式错误"})
        except NotImplementedError:
            # 回退：同步子进程 + 线程管道读取，同时写入进度文件并通过WS推送
            try:
                # 提示前端切换为进度轮询显示（仍保持WS在线推送能力）
                if dev_mode:
                    with contextlib.suppress(Exception):
                        await ws.send_json(
                            {
                                "type": "log",
                                "source": "system",
                                "text": "事件循环不支持异步子进程，切换为兼容模式。",
                            }
                        )

                proc = subprocess.Popen(
                    命令,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=str(项目根),
                    text=True,
                    encoding="utf-8",
                    shell=False,
                )

                stdout_lines: List[str] = []
                stderr_lines: List[str] = []
                事件循环 = asyncio.get_running_loop()

                def _reader(pipe, buffer, source: str):
                    for line in iter(pipe.readline, ""):
                        文本 = line.strip()
                        if not 文本:
                            continue
                        buffer.append(文本)
                        # 构造消息并异步推送到WS
                        消息 = {"type": "log", "source": source, "text": 文本}
                        if 文本.startswith("PROGRESS:"):
                            部分 = 文本.split(":")
                            if len(部分) >= 4:
                                try:
                                    百分比 = float(部分[2].replace("%", ""))
                                    状态 = 部分[3] if len(部分) > 3 else "处理中..."
                                    消息 = {"type": "progress", "progress": 百分比, "message": 状态}
                                except (ValueError, IndexError):
                                    pass
                        if dev_mode:
                            try:
                                事件循环.call_soon_threadsafe(asyncio.create_task, ws.send_json(消息))
                            except Exception:
                                pass

                        # 写入进度文件以支持HTTP轮询
                        try:
                            进度文件 = 配置.缓存目录 / "progress.json"
                            数据 = {}
                            if 进度文件.exists():
                                with open(进度文件, "r", encoding="utf-8") as f:
                                    数据 = json.load(f)
                            日志 = 数据.get("logs", [])
                            日志.append(文本)
                            if len(日志) > 200:
                                日志 = 日志[-200:]
                            数据["logs"] = 日志
                            if 文本.startswith("PROGRESS:"):
                                部分 = 文本.split(":")
                                if len(部分) >= 4:
                                    try:
                                        百分比 = float(部分[2].replace("%", ""))
                                        状态 = 部分[3] if len(部分) > 3 else "处理中..."
                                        数据["progress"] = 百分比
                                        数据["message"] = 状态
                                    except (ValueError, IndexError):
                                        pass
                            _安全写入_json(进度文件, 数据)
                        except Exception:
                            pass
                        try:
                            pipe.close()
                        except Exception:
                            pass

                t1 = threading.Thread(
                    target=_reader, args=(proc.stdout, stdout_lines, "stdout"), daemon=True
                )
                t2 = threading.Thread(
                    target=_reader, args=(proc.stderr, stderr_lines, "stderr"), daemon=True
                )
                t1.start()
                t2.start()

                # 等待进程结束
                await asyncio.to_thread(proc.wait)
                t1.join(timeout=1)
                t2.join(timeout=1)

                进度文件 = 配置.缓存目录 / "progress.json"
                if proc.returncode == 0:
                    解析 = None
                    try:
                        if 输出文件路径 and os.path.exists(输出文件路径):
                            with open(输出文件路径, "r", encoding="utf-8") as rf:
                                解析 = json.load(rf)
                    except Exception:
                        解析 = None
                    if 解析 is None:
                        标准输出文本 = "\n".join(stdout_lines)
                        解析 = _尝试解析JSON(标准输出文本)
                    if 解析 is not None:
                        # 写入最终结果
                        try:
                            数据 = {}
                            if 进度文件.exists():
                                with open(进度文件, "r", encoding="utf-8") as f:
                                    数据 = json.load(f)
                            数据.update({"progress": 100, "message": "回测完成", "result": 解析})
                            _安全写入_json(进度文件, 数据)
                        except Exception:
                            pass
                        await ws.send_json({"type": "result", "result": 解析})
                    else:
                        错误文本 = "结果格式错误"
                        try:
                            数据 = {}
                            if 进度文件.exists():
                                with open(进度文件, "r", encoding="utf-8") as f:
                                    数据 = json.load(f)
                            数据.update(
                                {
                                    "progress": 100,
                                    "message": "回测完成但结果解析失败",
                                    "error": 错误文本,
                                }
                            )
                            _安全写入_json(进度文件, 数据)
                        except Exception:
                            pass
                        await ws.send_json({"type": "error", "error": 错误文本})
                    错误文本 = "\n".join(stderr_lines) if stderr_lines else "回测失败"
                    try:
                        数据 = {}
                        if 进度文件.exists():
                            with open(进度文件, "r", encoding="utf-8") as f:
                                数据 = json.load(f)
                        数据.update(
                            {"progress": 0, "message": f"回测失败: {错误文本}", "error": 错误文本}
                        )
                        _安全写入_json(进度文件, 数据)
                    except Exception:
                        pass
                    await ws.send_json({"type": "error", "error": 错误文本})
            except Exception as e:
                错误文本 = str(e) if str(e) else repr(e)
                await ws.send_json({"type": "error", "error": 错误文本})
    finally:
        with contextlib.suppress(Exception):
            os.unlink(参数文件路径)
        # 保留 last_result.json 以便调试/兜底


if __name__ == "__main__":
    uvicorn.run("fastapi_backend.主程序:应用", host="0.0.0.0", port=8000, reload=False)
