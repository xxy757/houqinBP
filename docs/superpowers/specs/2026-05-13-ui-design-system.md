# 后勤部管理系统 - 全局 UI 设计规范

> 版本：v2.0
> 日期：2026-05-13
> 适用范围：前端 React 应用全部页面和组件

---

## 一、设计原则

| 原则 | 说明 |
|------|------|
| **统一性** | 所有页面遵循同一套设计 Token，杜绝硬编码颜色/字号/间距 |
| **清晰性** | 信息层级分明，操作意图明确，关键数据一眼可见 |
| **专业性** | 企业级管理系统的克制审美，无多余装饰，专注数据呈现 |
| **可维护性** | CSS 变量驱动，改一处全局生效；组件职责单一 |

---

## 二、设计 Token（CSS 变量）

### 2.1 主色（Primary Blue）

```css
--color-primary:        #2563EB;   /* 主蓝 */
--color-primary-hover:  #1D4ED8;   /* 悬停/按下 */
--color-primary-light:  #3B82F6;   /* 亮蓝 */
--color-primary-bg:     #EFF6FF;   /* 浅蓝背景 */
--color-primary-bg-subtle: #F5F9FF; /* 极浅蓝背景 */
```

### 2.2 业务域色（Domain Colors）

```css
--color-pro:     #0D9488;   /* 专业项目 - 青绿 */
--color-pro-bg:  #F0FDFA;
--color-it:      #7C3AED;   /* 信息化 - 紫色 */
--color-it-bg:   #F5F3FF;
--color-hr:      #D97706;   /* 人力资源 - 琥珀 */
--color-hr-bg:   #FFFBEB;
--color-fin:     #DC2626;   /* 财务 - 红色 */
--color-fin-bg:  #FEF2F2;
```

### 2.3 语义色（Semantic）

```css
--color-success:       #16A34A;
--color-success-bg:    #DCFCE7;
--color-warning:       #D97706;
--color-warning-bg:    #FEF3C7;
--color-danger:        #DC2626;
--color-danger-bg:     #FEE2E2;
--color-info:          #2563EB;
--color-info-bg:       #DBEAFE;
```

### 2.4 灰度（Slate Scale）

```css
--color-gray-50:   #F8FAFC;
--color-gray-100:  #F1F5F9;
--color-gray-200:  #E2E8F0;
--color-gray-300:  #CBD5E1;
--color-gray-400:  #94A3B8;
--color-gray-500:  #64748B;
--color-gray-600:  #475569;
--color-gray-700:  #334155;
--color-gray-800:  #1E293B;
--color-gray-900:  #0F172A;
```

### 2.5 侧边栏（Sidebar Specific）

```css
--sidebar-bg-start:  #0F1D3A;   /* 渐变起点 */
--sidebar-bg-end:    #162D50;   /* 渐变终点 */
--sidebar-text:      #94A3B8;   /* 默认文字 */
--sidebar-text-active: #93C5FD;  /* 激活文字 */
--sidebar-active-bg: rgba(59, 130, 246, 0.15); /* 激活背景 */
--sidebar-divider:   rgba(148, 163, 184, 0.1); /* 分割线 */
--sidebar-footer:    rgba(148, 163, 184, 0.35); /* 底部文字 */
```

### 2.6 字体

```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
               "Microsoft YaHei", "Helvetica Neue", sans-serif;
--font-mono: "SF Mono", "Fira Code", "Consolas", monospace;
```

### 2.7 字号阶梯（全部用 rem，基准 16px）

```css
--text-xs:   0.6875rem;   /* 11px - 标签、辅助说明 */
--text-sm:   0.75rem;     /* 12px - 表格正文、次要文本 */
--text-base: 0.8125rem;   /* 13px - 正文默认 */
--text-md:   0.875rem;    /* 14px - 小节标题、导航 */
--text-lg:   1rem;        /* 16px - 页面标题 */
--text-xl:   1.25rem;     /* 20px - KPI 小数字 */
--text-2xl:  1.5rem;      /* 24px - KPI 大数字 */
--text-3xl:  1.75rem;     /* 28px - 特大数字 */
```

### 2.8 间距（基于 4px）

```css
--space-xs:   0.25rem;   /* 4px  */
--space-sm:   0.5rem;    /* 8px  */
--space-md:   0.75rem;   /* 12px */
--space-base: 1rem;      /* 16px */
--space-lg:   1.25rem;   /* 20px */
--space-xl:   1.5rem;    /* 24px */
--space-2xl:  2rem;      /* 32px */
--space-3xl:  2.5rem;    /* 40px */
```

### 2.9 圆角

```css
--radius-sm:  4px;
--radius-md:  6px;
--radius-base: 8px;
--radius-lg:  10px;
--radius-xl:  12px;
--radius-full: 9999px;
```

### 2.10 阴影

```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.2);
```

### 2.11 过渡

```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

---

## 三、布局系统

### 3.1 整体结构

```
┌──────────┬────────────────────────────────────┐
│          │  Topbar (56px, sticky)             │
│ Sidebar  ├────────────────────────────────────┤
│ (240px)  │                                    │
│ fixed    │  Content Area                      │
│          │  padding: 24px                     │
│          │                                    │
└──────────┴────────────────────────────────────┘
```

- 侧边栏：`width: 240px`，`position: fixed`，`z-index: 100`
- 顶栏：`height: auto`（padding 撑开），`position: sticky`，`z-index: 50`
- 内容区：`margin-left: 240px`，`padding: 24px`
- 响应式断点：`1200px`（平板）、`768px`（手机）

### 3.2 页面标题规范

- Topbar 左侧显示当前页面标题（`--text-lg`，`font-weight: 700`）
- 所有页面标题与侧边栏导航项名称一致
- 不再使用 emoji 前缀

---

## 四、组件规范

### 4.1 侧边栏（Sidebar）

- **背景**：品牌蓝渐变 `linear-gradient(180deg, #0F1D3A, #162D50)`
- **Logo 区**：padding 20px，底部 1px 半透明分割线
- **Logo 图标**：蓝色时钟 SVG 24x24
- **标题**：14px 粗体白色，副标题 11px 半透明
- **导航项**：padding 8px 12px，border-radius 8px，gap 10px
- **图标**：16x16 SVG，默认 `--sidebar-text`，激活时 `--sidebar-text-active`
- **激活态**：`--sidebar-active-bg` 背景色，`--sidebar-text-active` 文字色，左侧无边线
- **悬停态**：背景 `rgba(255, 255, 255, 0.05)`，文字变白
- **底部信息**：`--sidebar-footer` 颜色，10px 字号

### 4.2 顶栏（Topbar）

- 白色背景，底部 1px `--color-gray-200` 边框
- padding：12px 24px
- 左侧：页面标题（可包含 SVG 图标 20x20 + 文字）
- 右侧：日期（`--text-sm`，`--color-gray-400`）+ 用户名（`--text-sm`，`--color-gray-700`）+ 操作按钮

### 4.3 按钮（Button）

| 变体 | 类名 | 背景 | 文字色 | 边框 | 悬停 |
|------|------|------|--------|------|------|
| 主要 | `.btn-primary` | `--color-primary` | #fff | 无 | `--color-primary-hover` |
| 次要 | `.btn-secondary` | #fff | `--color-gray-600` | `--color-gray-200` | `--color-gray-50` |
| 危险 | `.btn-danger` | 透明 | `--color-danger` | 无 | `--color-danger-bg` |
| 幽灵 | `.btn-ghost` | 透明 | `--color-gray-500` | 无 | `--color-gray-100` |

统一尺寸：`padding: 8px 16px`，`border-radius: var(--radius-md)` (6px)，`font-size: var(--text-sm)`，`font-weight: 600`

### 4.4 卡片（KPI Card / Section Card）

- **KPI Card**：白色背景，`--radius-lg` (10px)圆角，`--shadow-base` 阴影，左侧 3px 色条
- **Section Card**：白色背景，`--radius-lg` 圆角，`--shadow-base` 阴影，`border: 1px solid var(--color-gray-200)`
- Section 头部：padding 16px 20px，底部 1px `--color-gray-200` 分隔，标题 `--text-md` 粗体
- Section 内容区：无 padding（由内部内容自行处理），`overflow-x: auto`

### 4.5 表格（Table）

- 全宽 `border-collapse: collapse`，字号 `--text-sm`
- 表头：`--color-gray-50` 背景，`--text-xs` 字号，`--color-gray-500` 颜色，底部 2px `--color-gray-200` 边框
- 单元格：padding 10px 12px，底部 1px `--color-gray-100` 边框
- 行悬停：`--color-gray-50` 背景（专业项目行特殊：`--color-pro-bg`）
- 点击行：`cursor: pointer`（如需要）

### 4.6 表单输入（Input / Select）

- `width: 100%`，`padding: 8px 12px`
- `border: 1px solid var(--color-gray-300)`
- `border-radius: var(--radius-md)` (6px)
- `font-size: var(--text-base)` (13px)
- 聚焦态：`border-color: var(--color-primary)`，`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)`
- 标签：`font-size: var(--text-xs)`，`font-weight: 600`，`color: var(--color-gray-600)`，`margin-bottom: 4px`

### 4.7 状态标签（Status Tag）

| 状态 | 类名 | 背景 | 文字色 |
|------|------|------|--------|
| 已完成 | `.tag-success` | `--color-success-bg` | `--color-success` |
| 进行中 | `.tag-warning` | `--color-warning-bg` | `--color-warning` |
| 中断 | `.tag-danger` | `--color-danger-bg` | `--color-danger` |
| 未开始 | `.tag-default` | `--color-gray-100` | `--color-gray-500` |

通用样式：`display: inline-block`，`font-size: 10px`，`font-weight: 600`，`padding: 2px 10px`，`border-radius: 10px`

### 4.8 进度条（Progress Bar）

- 外层：`width: 100%`（最大 120px），`height: 6px`，`--color-gray-200` 背景，`--radius-full` 圆角
- 内层：`height: 100%`，`background: var(--color-primary)`（默认），`--radius-full` 圆角
- 过渡：`width` 属性 `--transition-slow`

### 4.9 标签页（Tabs）

- 容器：`display: flex; gap: 0`，底部 1px `--color-gray-200` 边框
- 按钮：`padding: 10px 20px`，`font-size: var(--text-base)`，`color: var(--color-gray-500)`
- 激活态：`color: var(--color-primary)`，底部 2px `--color-primary` 边框，`font-weight: 600`
- 悬停态：`color: var(--color-gray-700)`

### 4.10 弹窗（Modal）

- 遮罩：`position: fixed; inset: 0`，`background: rgba(0, 0, 0, 0.45)`，`z-index: 200`
- 卡片：白色背景，`--radius-xl` (12px)，`padding: 32px`，`width: 400px`，`max-width: 90vw`
- 标题：`--text-lg` 粗体，`margin-bottom: 20px`
- 输入框：同表单输入规范

### 4.11 分页（Pagination）

- 居中显示，`margin-top: 16px`
- 按钮：`padding: 6px 12px`，`border: 1px solid var(--color-gray-200)`，白色背景
- 当前页：`background: var(--color-primary)`，白色文字
- 省略号：`color: var(--color-gray-400)`
- 条数选择器：`--text-sm`，与分页按钮统一风格

### 4.12 搜索栏（Search Bar）

- 容器：`display: flex; gap: 8px`
- 输入框：`padding: 8px 12px`，同表单输入规范
- 按钮：次要按钮风格

---

## 五、图标系统

### 5.1 SVG 图标组件

创建 `src/components/Icons.tsx`，导出以下图标组件：

```tsx
// 所有图标均为 24x24 viewBox, stroke-width: 2, stroke-linecap: round, stroke-linejoin: round
```

| 组件名 | 用途 | 颜色变量 |
|--------|------|----------|
| `IconDashboard` | 驾驶舱总览 | `--color-pro` |
| `IconPro` | 专业项目 | `--color-pro` |
| `IconIT` | 信息化方案 | `--color-it` |
| `IconHR` | 人力资源 | `--color-hr` |
| `IconFin` | 财务管控 | `--color-fin` |
| `IconLink` | 联动配置 | `--color-primary` |
| `IconAdmin` | 系统管理 | `#8B5CF6` |
| `IconAudit` | 审计日志 | `#06B6D4` |
| `IconClock` | Logo/时间 | `#60A5FA` |
| `IconSearch` | 搜索 | `--color-gray-400` |
| `IconUser` | 用户 | `--color-gray-500` |
| `IconEdit` | 编辑 | `--color-gray-500` |
| `IconDelete` | 删除 | `--color-danger` |
| `IconAdd` | 新增 | `--color-primary` |
| `IconSave` | 保存 | `--color-primary` |
| `IconClose` | 关闭 | `--color-gray-400` |

### 5.2 图标使用规范

- 导航图标：16x16px，颜色由 sidebar 状态控制
- 页面标题图标：20x20px，对应业务域色
- 操作按钮图标：14x14px，跟随按钮颜色
- KPI 卡片不显示图标（用左侧色条替代）

---

## 六、页面规范

### 6.1 驾驶舱（DashboardPage）

- 顶部 4 个 KPI 卡片，`grid-template-columns: repeat(4, 1fr)`，gap 16px
- 内容区 2x2 网格，`grid-template-columns: 1fr 1fr`，gap 16px
- 每个 grid-item 为 Section 组件
- 表格行点：显示进度条 + 状态标签

### 6.2 专业项目 / 信息化（ProfessionalPage / ITPage）

- 顶部统计小卡片：`grid-template-columns: repeat(4, 1fr)`，gap 12px
- 搜索栏 + 新增按钮：`display: flex; justify-content: flex-end; gap: 8px`
- 项目列表为 Section 组件包裹的表格
- 编辑/新增表单：3 列 grid 布局
- 详情面板：2 列 grid 展示基本信息 + 阶段时间线

### 6.3 人力资源（HRPage）

- 3 个 Tab（团队现状 / 年度KPI规划 / 人员调整轨迹）
- 各 Tab 内部使用 Section + Table 组合
- 可编辑表格：单元格显示输入框

### 6.4 财务管控（FinancePage）

- 3 个 Tab（年度预算 / 执行时间线 / 降费方案明细）
- 预算视图：表格形式展示
- 时间线：tl-phase 组件展示各阶段

### 6.5 联动配置（LinkConfigPage）

- 联动概览卡片行
- 影响模拟器交互区
- 配置清单 CRUD 表格

### 6.6 登录页（LoginPage）

- 深蓝渐变背景：`linear-gradient(135deg, #1E293B, #0F172A)`
- 白色卡片居中，`--radius-xl`，`box-shadow: --shadow-modal`
- 标题 20px 粗体，副标题 12px `--color-gray-400`
- 输入框对齐全局表单规范
- 按钮：全宽蓝色主按钮

### 6.7 系统管理 / 审计日志

- 系统管理：用户+角色双 Tab
- 审计日志：多条件筛选栏（操作类型/资源类型/用户名）+ 日志表格

---

## 七、响应式设计

### 7.1 断点

| 断点 | 宽度 | 行为 |
|------|------|------|
| Desktop | > 1200px | 完整布局 |
| Tablet | 768px - 1200px | 网格变单列，KPI 变两列 |
| Mobile | < 768px | 侧边栏收缩至 60px，隐藏文字 |

### 7.2 网格调整

- `grid2` / `grid3` → 小屏变为单列
- `kpi-row` → 小屏 2 列 → 手机 1 列
- `stats-mini` → 小屏 2 列

---

## 八、动画规范

| 动画 | 属性 | 时长 | 缓动 |
|------|------|------|------|
| 页面切换 | opacity + translateY | 300ms | ease |
| 按钮悬停 | background / border-color | 200ms | ease |
| 导航项悬停 | background / color | 150ms | ease |
| 进度条变化 | width | 400ms | ease |
| 模态框出现 | opacity | 200ms | ease |
| 输入框聚焦 | border-color + box-shadow | 200ms | ease |

---

## 九、颜色使用速查表

| 场景 | 颜色 | CSS 变量 |
|------|------|----------|
| 页面背景 | #F8FAFC | `--color-gray-50` |
| 卡片背景 | #FFFFFF | `white` |
| 主操作按钮 | #2563EB | `--color-primary` |
| 主按钮悬停 | #1D4ED8 | `--color-primary-hover` |
| 正文文字 | #1E293B | `--color-gray-800` |
| 次要文字 | #64748B | `--color-gray-500` |
| 禁用/占位 | #94A3B8 | `--color-gray-400` |
| 边框 | #E2E8F0 | `--color-gray-200` |
| 分割线 | #F1F5F9 | `--color-gray-100` |
| 成功/完成 | #16A34A | `--color-success` |
| 警告/进行中 | #D97706 | `--color-warning` |
| 错误/中断 | #DC2626 | `--color-danger` |

---

## 十、代码规范

### 10.1 CSS 规则

1. 所有颜色必须使用 CSS 变量，禁止硬编码色值
2. 所有字号必须使用 `--text-*` 变量
3. 所有间距必须使用 `--space-*` 变量
4. 组件样式集中在 `Layout.css`，页面特殊样式在各自 `.css` 文件
5. 类名使用 kebab-case（如 `.btn-primary`、`.kpi-row`）
6. 过渡效果统一使用 `--transition-*` 变量

### 10.2 TSX 规则

1. 所有图标通过 `Icons.tsx` 组件引用，禁止 emoji 作为图标
2. 内联 style 仅用于动态值（如 `style={{ color: 'var(--color-pro)' }}`），静态样式用 class
3. 页面组件按以下顺序组织：hooks → state → effects → render
4. 通用组件保持在 `src/components/` 目录

### 10.3 文件组织

```
src/components/
  Icons.tsx          # 统一 SVG 图标组件（新建）
  Layout.tsx         # 布局壳（修改：引用图标组件）
  Layout.css         # 全局样式（重写）
  ...其他组件
src/pages/
  LoginPage.css      # 对齐全局 Token
  UserManagementPage.css  # 对齐全局 Token
  AuditLogPage.css   # 对齐全局 Token
```

---

## 十一、迁移检查清单

- [ ] `Layout.css` 完全重写，更新所有 CSS 变量
- [ ] 创建 `src/components/Icons.tsx`
- [ ] `Layout.tsx` 侧边栏和顶栏引用 SVG 图标，移除 emoji
- [ ] `DashboardPage.tsx` 移除 emoji，改为图标组件
- [ ] `ProfessionalPage.tsx` 移除 emoji，统一表单样式
- [ ] `ITPage.tsx` 移除 emoji
- [ ] `HRPage.tsx` 移除 emoji
- [ ] `FinancePage.tsx` 移除 emoji
- [ ] `LinkConfigPage.tsx` 移除 emoji
- [ ] `LoginPage.tsx` + `.css` 对齐全局 Token
- [ ] `UserManagementPage.tsx` + `.css` 对齐全局 Token
- [ ] `AuditLogPage.tsx` + `.css` 对齐全局 Token
- [ ] `UserManagementPage.css` 对齐全局变量，统一字号和间距
- [ ] `AuditLogPage.css` 对齐全局变量
- [ ] 全局视觉一致性自查（字号、间距、颜色、圆角、阴影）
- [ ] 响应式断点测试
