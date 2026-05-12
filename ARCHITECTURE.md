# 后勤部四项规划统筹管理系统 · 架构全景文档

> **目标读者**：AI 编程助手 / 新加入的开发者
> **阅读本文档后**，你将对项目的整体结构、数据流、接口信息有完整认知，可以立即开始修改或扩展代码。

---

## 一、项目总览

```
┌────────────────────────────────────────────────────┐
│        后勤部四项规划统筹管理系统 v1.0             │
│                                                     │
│  数据来源：5个Excel  →  SQLite  →  API  →  Web UI   │
│                                                     │
│  业务域：专业项目 | 信息化方案 | 人力资源 | 财务管控  │
│    + 驾驶舱总览 | 联动配置(待开发)                   │
└────────────────────────────────────────────────────┘
```

| 维度 | 技术栈 |
|------|--------|
| **前端** | React 19 + TypeScript 6 + Vite 8 + React Router 7 |
| **后端** | Python FastAPI 0.115 + Uvicorn |
| **数据库** | SQLite 3（单文件 `data/houqin.db`） |
| **数据来源** | 5 个 Excel 文件（`四项规划/` 目录） |
| **端口** | 前端 `5173`(Vite) → 代理 → 后端 `8001` |

**数据流向**：
```
Excel 文件 ──[extract_data.py]──▶ SQLite DB ──[FastAPI]──▶ JSON API ──[fetch]──▶ React 页面
```

---

## 二、后端架构

### 2.1 整体结构图

```
backend/
├── main.py                    # ★ 应用入口，路由注册
├── database.py                # ★ 数据库连接（SQLite）
├── server.py                  # 旧版入口（兼容，已不推荐使用）
├── requirements.txt           # 依赖：fastapi, uvicorn
├── extract_data.py            # ★ 从5个Excel提取数据建库
├── verify_data.py             # 数据校验脚本
├── verify_accuracy.py         # Excel vs DB 对比校验
├── data/
│   └── houqin.db              # ★ SQLite 数据库（运行时生成）
└── routes/
    ├── __init__.py
    ├── dashboard.py            # 驾驶舱总览 KPI
    ├── professional.py         # 专业项目 CRUD
    ├── it_projects.py          # 信息化项目 CRUD
    ├── hr.py                   # 人力资源 查询/CRUD
    └── finance.py              # 财务管控 预算/时间线/降费
```

### 2.2 启动流程

```
1. uvicorn main:app --port 8001
      │
2. main.py: @app.on_event("startup") → init_db()
      │
3. database.py: init_db() → sqlite3.connect(DB_PATH) → PRAGMA WAL → close
      │
4. 路由注册 (用数据库就打开，用完就close，无连接池)
```

**注意**：数据库文件 `houqin.db` 需要先通过 `extract_data.py` 从 Excel 生成。
启动方式：`cd backend && python extract_data.py && python main.py`（或 `python server.py`）

### 2.3 数据库表结构（11 张表）

```
┌─────────────────────────────────────────────────────────────┐
│                    SQLite: houqin.db                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │ professional_projects│    │ it_projects          │        │
│  │─────────────────────│    │─────────────────────│        │
│  │ id (PK)             │    │ id (PK)             │        │
│  │ department          │    │ category            │        │
│  │ name                │    │ name                │        │
│  │ goal                │    │ goal                │        │
│  │ context             │    │ context             │        │
│  │ deliverable         │    │ deliverable         │        │
│  │ person              │    │ owner               │        │
│  │ start_date / end_date│   │ start_date / end_date│       │
│  │ duration            │    │ duration            │        │
│  │ phase_count         │    │ difficulty          │        │
│  └──────┬──────────────┘    │ solve               │        │
│         │                   │ phase_count         │        │
│         │ 1:N               └──────┬──────────────┘        │
│         ▼                          │ 1:N                    │
│  ┌─────────────────────┐    ┌──────▼──────────────┐        │
│  │ professional_project │    │ it_project_phases    │        │
│  │ _phases             │    │─────────────────────│        │
│  │─────────────────────│    │ project_id (FK)     │        │
│  │ project_id (FK)     │    │ phase_order         │        │
│  │ phase_order         │    │ phase_name          │        │
│  │ phase_name          │    │ phase_content       │        │
│  │ phase_content       │    └─────────────────────┘        │
│  └─────────────────────┘                                   │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │ employees            │    │ employee_monthly    │        │
│  │─────────────────────│    │ _status             │        │
│  │ id (PK)             │    │─────────────────────│        │
│  │ employee_id         │    │ employee_name       │        │
│  │ name                │    │ month (1-12)        │        │
│  │ post / department_* │    │ status              │        │
│  │ education / age     │    └─────────────────────┘        │
│  │ entry_date / gender │                                    │
│  │ professional_match  │    ┌─────────────────────┐        │
│  │ status              │    │ hr_plan_kpi          │        │
│  │ ... (30+列)         │    │─────────────────────│        │
│  └─────────────────────┘    │ indicator           │        │
│                             │ target              │        │
│  ┌─────────────────────┐    │ m1~m12 (逐月值)     │        │
│  │ financial_budget     │    └─────────────────────┘        │
│  │─────────────────────│                                    │
│  │ id (PK)             │    ┌─────────────────────┐        │
│  │ category            │    │ financial_indicators │        │
│  │ department          │    │─────────────────────│        │
│  │ m1~m12 (逐月预算)    │    │ indicator_name      │        │
│  │ total / budget_num  │    │ value / unit        │        │
│  └─────────────────────┘    │ section             │        │
│                             └─────────────────────┘        │
│  ┌─────────────────────┐                                    │
│  │ financial_timeline   │   ┌─────────────────────┐        │
│  │─────────────────────│   │ financial_reduction   │        │
│  │ phase_name          │   │─────────────────────│        │
│  │ seq / task_name     │   │ section             │        │
│  │ responsible         │   │ cost_subject        │        │
│  │ time_range          │   │ year_2025_actual    │        │
│  │ action_desc         │   │ year_budget / change │       │
│  │ precondition        │   │ detail_item         │        │
│  │ deliverable         │   │ category / priority │        │
│  └─────────────────────┘   │ reduction_plan      │        │
│                            └─────────────────────┘        │
│  ┌─────────────────────┐                                    │
│  │ department_key_items │                                   │
│  │─────────────────────│                                    │
│  │ key_item            │                                    │
│  │ sub_category        │                                    │
│  │ problem / baseline  │                                    │
│  │ target / improvement│                                    │
│  │ seq / sub_project   │                                    │
│  │ action_content      │                                    │
│  │ deliverable / person│                                    │
│  │ start_date / end_date│                                   │
│  │ section             │                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 路由注册表（main.py）

| 路由模块 | Prefix | Tag | 说明 |
|----------|--------|-----|------|
| `routes/dashboard.py` | `/api` | 驾驶舱 | 总览KPI |
| `routes/professional.py` | `/api/professional-projects` | 专业项目 | 完整CRUD |
| `routes/it_projects.py` | `/api/it-projects` | 信息化方案 | 完整CRUD |
| `routes/hr.py` | `/api/hr` | 人力资源 | 查询 + CRUD |
| `routes/finance.py` | `/api/finance` | 财务管控 | 预算/时间线/降费 CRUD |

### 2.5 公共依赖模式

```python
# 每个 routes/*.py 的模式：
from fastapi import APIRouter
from database import get_db

router = APIRouter()

@router.get("/xxx")
def handler():
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("SQL", params).fetchall()]
    db.close()
    return rows
```

**关键约定**：
- 无 ORM，全部手写 SQL
- 每次请求独立 `connect` + `close`，无连接池
- 查询结果用 `dict(r)` 转换
- `server.py` 是早期单文件版本，现在路由已拆分到 `routes/`，两者**共享同一个数据库**

---

## 三、前端架构

### 3.1 整体结构图

```
frontend/
├── index.html                      # 入口 HTML
├── vite.config.ts                  # Vite 配置（含 API 代理）
├── package.json                    # React 19 + Vite 8
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── eslint.config.js
└── src/
    ├── main.tsx                    # React 挂载点
    ├── App.tsx                     # ★ 路由定义
    │
    ├── components/                 # 公共组件层
    │   ├── Layout.tsx              # ★ 全局布局（侧边栏+顶栏+内容区）
    │   ├── Layout.css              # ★ 全局样式（CSS变量+组件样式）
    │   ├── Section.tsx             # 通用卡片容器
    │   ├── Tabs.tsx                # Tab 切换组件
    │   ├── DataTable.tsx           # 数据表格
    │   ├── ProgressBar.tsx         # 进度条
    │   ├── PhaseDots.tsx           # 阶段圆点
    │   └── StatusTag.tsx           # 状态标签
    │
    ├── pages/                      # 页面层
    │   ├── DashboardPage.tsx       # 驾驶舱总览
    │   ├── ProfessionalPage.tsx    # 专业项目（CRUD）
    │   ├── ITPage.tsx              # 信息化方案（CRUD）
    │   ├── HRPage.tsx              # 人力资源（3个Tab）
    │   ├── FinancePage.tsx         # 财务管控（3个Tab）
    │   └── LinkConfigPage.tsx      # 联动配置（待开发）
    │
    ├── services/
    │   └── api.ts                  # ★ 所有 API 接口定义 + TypeScript 类型
    │
    ├── types/
    │   └── index.ts                # 旧版类型定义（部分已被 api.ts 覆盖）
    │
    └── data/
        └── index.ts                # 旧版硬编码 mock 数据（已废弃，使用 API）
```

### 3.2 路由表（React Router v7）

```
<BrowserRouter>
  <Layout />                          ← 全局布局（侧边栏 + 顶栏）
    ├─ /          → redirect /dash
    ├─ /dash      → DashboardPage    驾驶舱总览
    ├─ /pro       → ProfessionalPage 专业项目
    ├─ /it        → ITPage           信息化方案
    ├─ /hr        → HRPage           人力资源
    ├─ /fin       → FinancePage      财务管控
    └─ /link      → LinkConfigPage   联动配置（占位）
```

**URL 模式**：`/` + 简短路径名（dash/pro/it/hr/fin/link）

### 3.3 组件树与数据流

```
App
 └─ Layout                              [侧边栏: 6个导航链接]
     └─ <Outlet/>                       [根据路由渲染页面]
         ├─ DashboardPage               [GET /api/dashboard → 4个KPI卡片 + 4个表格]
         │
         ├─ ProfessionalPage            [GET/POST/PUT/DELETE /api/professional-projects]
         │   └─ Section + table + PhaseDots
         │
         ├─ ITPage                      [GET/POST/PUT/DELETE /api/it-projects]
         │   └─ StatusTag + table
         │
         ├─ HRPage                      [GET /api/hr/*]
         │   ├─ Tab: 团队现状(overview)  → GET /hr/employees + /hr/distributions
         │   ├─ Tab: 年度KPI规划(plan)   → GET /hr/plan-kpi
         │   └─ Tab: 人员调整轨迹(change)→ GET /hr/monthly-changes
         │
         ├─ FinancePage                 [GET /api/finance/*]
         │   ├─ Tab: 26-27年预算(budget) → GET /finance/budget
         │   ├─ Tab: 执行时间线(timeline)→ GET /finance/timeline
         │   └─ Tab: 降费方案(reduction) → GET /finance/reduction
         │
         └─ LinkConfigPage             [无API调用，纯展示]
```

### 3.4 状态管理模式

```
模式：每个页面独立的 useState + useEffect（无全局状态管理库）

DashboardPage:  const [data, setData] = useState<DashboardData | null>(null)
                 useEffect → api.getDashboard() → setData

ProfessionalPage: const [projects, setProjects] = useState([])
                  const [editing, setEditing] = useState  (表单模式切换)
                  const [form, setForm] = useState        (表单字段)

HRPage:     const [activeTab, setActiveTab] = useState<'overview'|'plan'|'change'>()
            const [employees, dist, planKPI, changes] = 4个独立state
            useEffect → Promise.all([4个API]) → set全部

FinancePage: const [activeTab, setActiveTab] = useState<'budget'|'timeline'|'reduction'>()
             const [budget, timeline, reduction] = 3个独立state
             useEffect → Promise.all([3个API]) → set全部
```

**特点**：
- 无 Redux / Zustand / Context
- 每个页面完全独立加载
- 页面切换时重新 mount，重新 fetch（Layout 中用 `key={location.pathname}` 控制动画，但不会触发 Outlet 重新挂载，每个页面自己 `useEffect([], load)`）
- CRUD 操作后调用 `load()` 重新拉取全量数据

### 3.5 API 代理配置

```
vite.config.ts:
  '/api' → http://localhost:8001    （开发环境）
  
生产环境：前端构建产物由 any static server 托管，需单独配置反向代理
```

### 3.6 样式体系

```
CSS 变量定义在 Layout.css 中：
  --pri: #1a73e8    (主色-蓝)
  --pro: #0D9488    (专业项目-青)
  --it:  #7C3AED    (信息化-紫)
  --hr:  #D97706    (人力资源-橙)
  --fin: #DC2626    (财务管控-红)
  --g50 ~ --g900    (灰色色阶)
  --R: 10px, --Rs: 6px    (圆角)
  --sh: box-shadow  (阴影)

每个业务域有独立色彩标识（KPI卡片左边框、小圆点、信息卡背景、状态标签等）
```

---

## 四、完整 API 接口清单

### 4.1 驾驶舱总览

| 方法 | 路径 | 后端文件 | 说明 |
|------|------|----------|------|
| `GET` | `/api/dashboard` | `routes/dashboard.py` | 总览KPI + Top项目 + 分布数据 |
| `GET` | `/api/health` | `main.py` | 健康检查 |

**GET `/api/dashboard` 返回**：
```json
{
  "kpi": {
    "proj_count": 16,       // 专业项目总数
    "it_count": 17,         // 信息化项目总数
    "it_done": 2,           // 已完成数
    "it_doing_planning": 15,// 推进/规划中
    "emp_count": 53,        // 当前在编人数
    "emp_target": 48,       // 目标编制
    "total_budget": 2139,   // 年度预算(万)
    "q1_actual": 540        // Q1实际支出(万)
  },
  "top_projects": [         // 专业项目 Top8
    { "id":1, "department":"综合物料库", "name":"...", "goal":"...",
      "person":"...", "start_date":"...", "end_date":"...",
      "duration":"...", "phase_count":6, "phases":[...] }
  ],
  "top_it_projects": [...], // 信息化项目 Top8
  "dept_distribution": [    // 部门项目分布
    { "label":"行政事务处", "count":6, "rate_pct":37.5 }
  ],
  "finance_categories": [   // 费用类别汇总
    { "cat":"工资福利", "budget":12000000, "rate":"56%" }
  ]
}
```

### 4.2 专业项目

| 方法 | 路径 | 后端文件 | 说明 |
|------|------|----------|------|
| `GET` | `/api/professional-projects` | `routes/professional.py` | 列表（含阶段数据） |
| `GET` | `/api/professional-projects/{id}` | `routes/professional.py` | 详情 |
| `POST` | `/api/professional-projects` | `routes/professional.py` | 新增 |
| `PUT` | `/api/professional-projects/{id}` | `routes/professional.py` | 更新 |
| `DELETE` | `/api/professional-projects/{id}` | `routes/professional.py` | 删除（级联删除阶段） |
| `POST` | `/api/professional-projects/{id}/phases` | `routes/professional.py` | 添加阶段 |
| `DELETE` | `/api/professional-projects/{id}/phases/{phase_id}` | `routes/professional.py` | 删除阶段 |

**POST/PUT Body**（ProjectCreate）：
```json
{
  "id": null,            // 可选，不传则自增
  "department": "string",
  "name": "string",
  "goal": "string",
  "context": "string",
  "deliverable": "string",
  "person": "string",
  "start_date": "string",
  "end_date": "string",
  "duration": "string",
  "phase_count": 0
}
```

**POST phases Body**（PhaseCreate）：
```json
{
  "project_id": 1,
  "phase_order": 1,
  "phase_name": "第一阶段",
  "phase_content": "..."
}
```

### 4.3 信息化项目

| 方法 | 路径 | 后端文件 | 说明 |
|------|------|----------|------|
| `GET` | `/api/it-projects` | `routes/it_projects.py` | 列表（含阶段） |
| `GET` | `/api/it-projects/{id}` | `routes/it_projects.py` | 详情 |
| `POST` | `/api/it-projects` | `routes/it_projects.py` | 新增 |
| `PUT` | `/api/it-projects/{id}` | `routes/it_projects.py` | 更新 |
| `DELETE` | `/api/it-projects/{id}` | `routes/it_projects.py` | 删除（级联删除阶段） |

**POST/PUT Body**（ITProjectCreate）：
```json
{
  "id": null,
  "category": "string",    // 一级项目名
  "name": "string",        // 子项目名
  "goal": "string",
  "context": "string",
  "deliverable": "string",
  "owner": "string",
  "start_date": "string",
  "end_date": "string",
  "duration": "string",
  "difficulty": "string",  // 实施难点
  "solve": "string",       // 解决方案/状态（含"已完成"则判定done）
  "phase_count": 0
}
```

### 4.4 人力资源

| 方法 | 路径 | 后端文件 | 说明 |
|------|------|----------|------|
| `GET` | `/api/hr/employees?page=1&page_size=100` | `routes/hr.py` | 分页员工列表 |
| `GET` | `/api/hr/employees/{id_or_employee_id}` | `routes/hr.py` | 员工详情（支持DB id或工号） |
| `POST` | `/api/hr/employees` | `routes/hr.py` | 新增员工 |
| `PUT` | `/api/hr/employees/{id}` | `routes/hr.py` | 更新员工 |
| `DELETE` | `/api/hr/employees/{id}` | `routes/hr.py` | 删除员工（级联月度状态） |
| `GET` | `/api/hr/distributions` | `routes/hr.py` | 学历/年龄/性别/职务分布统计 |
| `GET` | `/api/hr/plan-kpi` | `routes/hr.py` | 人力规划KPI（在编/优化/调岗/新增逐月） |
| `POST` | `/api/hr/plan-kpi` | `routes/hr.py` | 批量更新KPI（DELETE+INSERT） |
| `GET` | `/api/hr/monthly-changes` | `routes/hr.py` | 人员月度状态变更轨迹 |

**GET `/api/hr/employees` 返回**：
```json
{
  "data": [
    { "id":1, "employee_id":"001", "name":"张三", "post":"主管",
      "dept":"综合物料库", "edu":"本科", "age":35,
      "entry_date":"2019-03-15", "match":"高", "gender":"男",
      "service":6.1, "status":"在岗" }
  ],
  "total": 53,
  "page": 1,
  "page_size": 100
}
```

**GET `/api/hr/distributions` 返回**：
```json
{
  "summary": {
    "total": 53,           // 在编人数
    "avg_age": 31.5,       // 平均年龄
    "avg_service": 4.2,    // 平均司龄(年)
    "above_bachelor_pct": 28  // 本科以上占比%
  },
  "education": [           // 学历分布
    { "label":"大专", "count":25, "rate":"47.2" }
  ],
  "age": [                 // 年龄分布(20-25/26-30/31-35/36-40/40+)
    { "label":"26-30", "count":18, "rate":"34%" }
  ],
  "gender": [              // 性别分布
    { "label":"男", "count":31, "rate":"58.5%" }
  ],
  "post_distribution": [   // 职务分布
    { "label":"主管", "count":6, "rate":"11.3%" }
  ]
}
```

**GET `/api/hr/plan-kpi` 返回**：
```json
[
  { "item": "在编人数(在编)", "target": "48",
    "data": ["53","53","53","53","53","52","51","50","49","48","48","48"] },
  { "item": "优化人数(优化)", "target": "11",
    "data": ["0","0","0","0","0","1","2","3","4","5","5","5"] }
]
```

**GET `/api/hr/monthly-changes` 返回**：
```json
[
  { "name":"张艳", "dept":"综合物料库", "post":"专员",
    "m4":"在岗", "m5":"在岗", "m6":"调岗", "m7":"后勤保障处", "m8":"在岗" }
]
// 仅返回有非"在岗"状态的员工，取4-8月数据
```

### 4.5 财务管控

| 方法 | 路径 | 后端文件 | 说明 |
|------|------|----------|------|
| `GET` | `/api/finance/indicators` | `routes/finance.py` | 宏观指标+汇总摘要 |
| `GET` | `/api/finance/budget` | `routes/finance.py` | 预算明细列表 |
| `POST` | `/api/finance/budget` | `routes/finance.py` | 新增预算项 |
| `PUT` | `/api/finance/budget/{id}` | `routes/finance.py` | 更新预算项 |
| `DELETE` | `/api/finance/budget/{id}` | `routes/finance.py` | 删除预算项 |
| `GET` | `/api/finance/timeline` | `routes/finance.py` | 执行时间线（按阶段聚合） |
| `GET` | `/api/finance/reduction` | `routes/finance.py` | 降费方案列表 |
| `POST` | `/api/finance/reduction` | `routes/finance.py` | 新增降费项 |
| `PUT` | `/api/finance/reduction/{id}` | `routes/finance.py` | 更新降费项 |
| `DELETE` | `/api/finance/reduction/{id}` | `routes/finance.py` | 删除降费项 |

**GET `/api/finance/indicators` 返回**：
```json
{
  "summary": {
    "total_budget": 2139,       // 总预算(万)
    "q1_actual": 540,           // Q1实际
    "execution_rate": "25.25%", // 执行率
    "remaining": 1599           // 剩余(万)
  },
  "indicators": [{ "indicator_name":"...", "value":..., "unit":"...", "section":"..." }]
}
```

**GET `/api/finance/budget` 返回**：
```json
[
  { "id":1, "cat":"工资福利", "department":"后勤部",
    "m1":"1000000", ..., "m12":"1000000",
    "total":"12000000", "budget":12000000 }
]
```

**GET `/api/finance/timeline` 返回**：
```json
[
  { "phase":"第一阶段", "date":"2026.5-6",
    "items":["专业项目启动", "信息化方案设计", "人员编制优化"] }
]
```

**GET `/api/finance/reduction` 返回**：
```json
[
  { "id":1, "section":"人员费用降费", "subject":"工资福利",
    "prev":1467, "curr":1200, "change":"-18%",
    "detail":"优化11人编制", "category":"人员", "level":"P0",
    "plan":"通过岗位合并、流程优化减少编制" }
]
```

### 4.6 其他

| 方法 | 路径 | 后端文件 | 说明 |
|------|------|----------|------|
| `GET` | `/api/department-key-items` | `server.py` | 部门重点事项 |

---

## 五、项目关键约定与注意事项

### 5.1 数据库操作约定
- **无 ORM**，全部原始 SQL
- 每次请求独立 `connect()` + `close()`，无连接池
- 查询结果统一用 `[dict(r) for r in cur.execute(...)]` 转换
- `server.py`（单文件版）和 `routes/`（模块版）存在**重复路由**，`main.py` 只注册 `routes/` 下的路由。如果运行 `server.py` 直接启动，则使用旧版路由。实际生产入口是 `main.py`

### 5.2 前端 API 调用约定
- 统一通过 `services/api.ts` 中的 `fetchAPI<T>()` 和 `sendAPI<T>()` 封装
- `fetchAPI` 处理 GET，`sendAPI` 处理 POST/PUT/DELETE
- 所有 API 基路径为 `/api`，由 Vite proxy 转发到 `localhost:8001`
- TypeScript 类型定义在同一个 `api.ts` 文件中

### 5.3 数据初始化流程
```
首次部署：
  cd backend
  python extract_data.py    # 从 四项规划/*.xlsx 提取 → 生成 houqin.db（约11张表）
  python main.py            # 或者 python server.py
```
`extract_data.py` 会**先删除已有数据库再重建**（`os.remove(DB_PATH)`）。
数据源位于项目根目录 `四项规划/` 文件夹，包含 5 个 Excel：
- `后勤部-专业.xlsx`
- `后勤部-信息化.xlsx`
- `后勤部-人力.xlsx`
- `后勤部-财务.xlsx`
- `后勤部部门重点事项.xlsx`

### 5.4 联动配置状态
`/link` 页面（LinkConfigPage.tsx）是**占位页面**，描述了四个维度间的缺失映射关系但尚未实现功能。该页面无任何 API 调用。

### 5.5 data/index.ts 与 api.ts 的关系
- `services/api.ts` — **当前使用的**：定义 API 调用函数和类型，数据来自后端 DB
- `data/index.ts` — **旧版 mock 数据**：硬编码的演示数据，已不再被页面引用
- `types/index.ts` — **旧版类型定义**：部分类型已不再与 API 返回匹配

### 5.6 IT项目状态判定逻辑
```typescript
// 前端判定（api.ts 返回 solve 字段）
function getStatus(p: ITProject): 'done' | 'doing' | 'plan' {
  if (p.solve?.includes('已完成')) return 'done'      // 后端用 solve LIKE '%已完成%'
  if (p.phaseList?.length > 0) return 'doing'
  return 'plan'
}
```

### 5.7 "server.py vs main.py" 差异
两个文件都创建了 FastAPI app 实例，功能高度重叠。`main.py` 是模块化版本（路由拆分到 routes/），`server.py` 是早期单文件版本。当前启动方式：
- **推荐**：`python main.py`（使用 routes/ 模块路由）
- **兼容**：`python server.py`（所有路由写在一个文件里）

两者使用**同一个数据库** `data/houqin.db`，都能正常工作。

---

## 六、修改指南（给 AI 助手）

### 场景A：新增一个页面/模块
1. 在 `src/pages/` 创建 `NewPage.tsx`
2. 如需新 API，在 `services/api.ts` 添加接口函数和类型
3. 在 `App.tsx` 的 `<Routes>` 添加 `<Route path="new" element={<NewPage />} />`
4. 在 `Layout.tsx` 的侧边栏添加 `<NavLink to="/new">`
5. 如是新业务域，后端在 `routes/` 新建 Python 文件，在 `main.py` 中 `include_router`
6. 如需新表，修改 `extract_data.py` 的 `create_db()` 并重新运行

### 场景B：修改现有 API
- 前端：修改 `services/api.ts` 中的函数和类型
- 后端：修改 `routes/*.py` 中的路由函数
- **注意**：如果同一个路由在 `server.py` 中也有定义，需要同步修改（或统一使用 `main.py`）

### 场景C：给专业项目增加"已验收"阶段判定
- 当前 `ProfessionalPage.tsx` 中 `已验收` 硬编码为 `0`，`pStat` 硬编码为第一个阶段 done
- 需要在数据库层面增加字段，或修改前端判定逻辑

### 场景D：添加全局状态
- 当前无状态管理库，搜索/筛选/排序等需求可直接在页面内用 useState 实现
- 如需跨页面共享，考虑 React Context（与现有模式最兼容）

### 常用命令
```bash
# 后端
cd backend
python extract_data.py    # 重建数据库
python main.py            # 启动API (端口8001)

# 前端
cd frontend
npm install               # 安装依赖
npm run dev               # 启动开发服务器 (端口5173，自动代理API)
npm run build             # 构建生产版本
npm run lint              # ESLint 检查
```
