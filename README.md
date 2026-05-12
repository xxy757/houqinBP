# 后勤部四项规划统筹管理系统

为"宝士制冷"后勤部门提供四大维度的规划统筹管理平台，覆盖**专业项目**、**信息化方案**、**人力资源**、**财务管控**四大业务领域。

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^19.2.6 | UI 框架 |
| React Router DOM | ^7.15.0 | 客户端路由 |
| TypeScript | ~6.0.2 | 类型系统 |
| Vite | ^8.0.12 | 构建工具 |
| CSS Variables | - | 设计系统 / 主题 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | >= 3.8 | 后端语言 |
| FastAPI | 0.115.0 | Web 框架 |
| Uvicorn | 0.30.0 | ASGI 服务器 |
| SQLite | 内置 | 数据库 |
| openpyxl | - | Excel 数据导入 |

---

## 项目结构

```
houqinBP/
├── backend/                         # 后端服务
│   ├── data/
│   │   └── houqin.db                # SQLite 数据库
│   ├── routes/                      # 模块化路由
│   │   ├── dashboard.py             # 驾驶舱总览
│   │   ├── finance.py               # 财务管控
│   │   ├── hr.py                    # 人力资源
│   │   ├── it_projects.py           # 信息化方案
│   │   └── professional.py          # 专业项目
│   ├── database.py                  # 数据库连接管理
│   ├── extract_data.py              # Excel → SQLite 数据提取
│   ├── main.py                      # FastAPI 入口（推荐）
│   ├── server.py                    # 旧版单体 API 入口
│   ├── requirements.txt             # Python 依赖
│   ├── verify_accuracy.py           # 数据校验脚本
│   └── verify_data.py               # 数据查看脚本
│
├── frontend/                        # 前端应用
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/              # 通用组件
│   │   │   ├── DataTable.tsx        # 数据表格
│   │   │   ├── Layout.tsx           # 主布局（侧栏+顶栏+内容区）
│   │   │   ├── Layout.css           # 全局样式 / 设计系统
│   │   │   ├── PhaseDots.tsx        # 阶段进度圆点
│   │   │   ├── ProgressBar.tsx      # 进度条
│   │   │   ├── Section.tsx          # 卡片/区块容器
│   │   │   ├── StatusTag.tsx        # 状态标签
│   │   │   └── Tabs.tsx             # 标签页切换
│   │   ├── data/
│   │   │   └── index.ts             # 静态兜底数据
│   │   ├── pages/                   # 页面组件
│   │   │   ├── DashboardPage.tsx    # 驾驶舱总览
│   │   │   ├── FinancePage.tsx      # 财务管控
│   │   │   ├── HRPage.tsx           # 人力资源
│   │   │   ├── ITPage.tsx           # 信息化方案
│   │   │   ├── LinkConfigPage.tsx   # 四维联动配置
│   │   │   └── ProfessionalPage.tsx # 专业项目
│   │   ├── services/
│   │   │   └── api.ts               # API 调用封装
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript 类型定义
│   │   ├── App.tsx                  # 根组件 / 路由配置
│   │   └── main.tsx                 # 应用入口
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── prototype/
│   └── index.html                   # 原始单页面原型
│
├── 四项规划/                         # Excel 源数据文件
│   ├── 后勤部-专业.xlsx
│   ├── 后勤部-信息化.xlsx
│   ├── 后勤部-人力.xlsx
│   ├── 后勤部-财务.xlsx
│   └── 后勤部部门重点事项.xlsx
│
└── 四项规划.zip                      # 源数据压缩包
```

---

## 快速开始

### 环境要求

- **Python** >= 3.8
- **Node.js** >= 18

### 1. 初始化数据

将 Excel 源数据导入 SQLite 数据库：

```bash
cd backend
pip install openpyxl
python extract_data.py
```

### 2. 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

API 服务启动在 `http://localhost:8001`，健康检查：`GET /api/health`

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

开发服务器启动在 `http://localhost:5173`，API 请求自动代理到后端 `8001` 端口。

---

## 常用命令

### 前端

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | TypeScript 编译 + Vite 生产构建 |
| `npm run lint` | ESLint 代码检查 |
| `npm run preview` | 预览生产构建 |

### 后端

| 命令 | 说明 |
|------|------|
| `uvicorn main:app --host 0.0.0.0 --port 8001` | 启动模块化 API（推荐） |
| `python server.py` | 启动旧版单体 API |
| `python extract_data.py` | Excel 数据导入数据库 |
| `python verify_accuracy.py` | 校验数据库与 Excel 数据一致性 |

---

## 页面与路由

| 路由 | 页面 | 功能 |
|------|------|------|
| `/dash` | 驾驶舱总览 | KPI 卡片、专业项目进度、信息化状态、部门分布、费用结构 |
| `/pro` | 专业项目管理 | 17 个专业项目清单，可查看详情（阶段、目标、交付物） |
| `/it` | 信息化方案管理 | 9 个信息化子项目，按一级项目分类，展示状态与难点 |
| `/hr` | 人力资源管理 | 三个标签页：团队现状（53人）、年度 KPI 规划（逐月）、人员调整轨迹 |
| `/fin` | 财务管控 | 三个标签页：26-27 年预算、执行时间线（5 阶段）、降费方案明细 |
| `/link` | 四维联动配置 | 四维度映射关系（概念阶段，待完善） |

---

## API 接口

### 驾驶舱

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/dashboard` | 获取驾驶舱汇总数据 |

### 专业项目

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/professional/` | 获取全部专业项目 |
| GET | `/api/professional/{id}` | 获取单个项目详情 |
| POST | `/api/professional/` | 创建专业项目 |
| PUT | `/api/professional/{id}` | 更新专业项目 |
| DELETE | `/api/professional/{id}` | 删除专业项目 |
| POST | `/api/professional/{id}/phases` | 添加项目阶段 |
| DELETE | `/api/professional/{id}/phases/{phase_id}` | 删除项目阶段 |

### 信息化方案

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/it/` | 获取全部信息化项目 |
| GET | `/api/it/{id}` | 获取单个项目详情 |
| POST | `/api/it/` | 创建信息化项目 |
| PUT | `/api/it/{id}` | 更新信息化项目 |
| DELETE | `/api/it/{id}` | 删除信息化项目 |

### 人力资源

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/hr/roster` | 获取人员名册 |
| GET | `/api/hr/stats` | 获取人员统计（学历/年龄/性别/岗位分布） |
| GET | `/api/hr/plan` | 获取年度 KPI 规划 |
| POST | `/api/hr/plan` | 更新年度 KPI 规划 |
| GET | `/api/hr/changes` | 获取人员月度调整记录 |

### 财务管控

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/finance/indicators` | 获取宏观指标 |
| GET | `/api/finance/budget` | 获取预算数据 |
| GET | `/api/finance/timeline` | 获取执行时间线 |
| GET | `/api/finance/reduction` | 获取降费方案 |

### 系统

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |

---

## 数据流架构

```
Excel 源文件（四项规划/）
    ↓ extract_data.py (openpyxl)
SQLite (backend/data/houqin.db)
    ↓ FastAPI (Uvicorn :8001)
REST API (JSON)
    ↓ fetch (Vite proxy)
React SPA (Vite :5173)
    → Browser
```

---

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `professional_projects` | 专业项目主表 |
| `professional_project_phases` | 专业项目阶段明细 |
| `it_projects` | 信息化项目主表 |
| `it_project_phases` | 信息化项目阶段明细 |
| `employees` | 人员名册（71+ 字段） |
| `employee_monthly_status` | 人员月度状态记录 |
| `hr_plan_kpi` | 人力规划 KPI（按月） |
| `financial_budget` | 财务预算 |
| `financial_indicators` | 财务宏观指标 |
| `financial_timeline` | 财务执行时间线 |
| `financial_reduction` | 降费方案明细 |
| `department_key_items` | 部门重点事项 |

---

## 设计系统

项目使用基于 CSS 变量的统一设计语言：

| 变量 | 色值 | 用途 |
|------|------|------|
| `--color-primary` | `#1a73e8` | 主色调 |
| `--color-pro` | `#0D9488` | 专业项目 |
| `--color-it` | `#7C3AED` | 信息化方案 |
| `--color-hr` | `#D97706` | 人力资源 |
| `--color-fin` | `#DC2626` | 财务管控 |

- **响应式断点**：1200px / 768px
- **字体**：`-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei"`

---

## 项目特色

- **全数据管道**：Excel → SQLite → FastAPI → React 完整链路
- **双 API 版本**：模块化路由版本（`main.py`）与单体文件版本（`server.py`）共存
- **数据校验工具**：`verify_accuracy.py` 可对比 Excel 源数据与数据库数据的一致性
- **前端降级方案**：`src/data/index.ts` 包含硬编码兜底数据，API 不可用时前端仍可正常展示
- **原始原型**：`prototype/index.html` 为完整的单页面原型，可用于快速验证设计思路
