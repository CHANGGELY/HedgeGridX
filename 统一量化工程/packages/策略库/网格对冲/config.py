"""
配置文件，用于管理项目中的路径和其他配置项
"""

import os

# 项目根目录
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# 数据文件路径
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)

# 各种数据文件路径模板
PRICE_DATA_PATH = os.path.join(DATA_DIR, '{}.h5')
SIGNALS_DATA_PATH = os.path.join(DATA_DIR, 'signals.h5')
POSITION_DATA_PATH = os.path.join(DATA_DIR, 'pos.h5')
EQUITY_CURVE_DATA_PATH = os.path.join(DATA_DIR, 'equity_curve.h5')