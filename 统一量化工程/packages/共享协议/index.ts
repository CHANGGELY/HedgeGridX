export type 任务编号 = string;

export interface 回测参数 {
  [键: string]: unknown;
}

export interface 绩效指标 {
  年化收益率: number;
  最大回撤: number;
  收益回撤比: number;
  胜率: number;
  交易次数: number;
}

export interface 资金点 {
  时间: string; // ISO date-time
  净值: number;
}

export type 资金曲线 = 资金点[];

export interface 订单 {
  时间: string; // ISO date-time
  方向: "买入" | "卖出";
  价格: number;
  数量: number;
}

export interface 风险指标 {
  波动率: number;
  夏普比率: number;
  卡玛比率?: number;
}

export interface 回测结果 {
  任务编号: 任务编号;
  交易对: string;
  时间框架: string;
  参数: 回测参数;
  绩效: 绩效指标;
  资金曲线: 资金曲线;
  订单列表?: 订单[];
  风险指标?: 风险指标;
}

