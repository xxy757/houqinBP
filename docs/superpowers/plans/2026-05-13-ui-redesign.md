# UI 设计规范实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 UI 设计规范 v2.0 重构前端视觉，统一全局 CSS 变量、替换 emoji 为 SVG 图标、对齐所有页面样式。

**Architecture:** 纯 CSS 变量驱动的设计系统，Layout.css 作为全局样式入口，Icons.tsx 统一管理所有 SVG 图标，逐页替换 emoji 引用并对齐 CSS 变量。

**Tech Stack:** React 19 + TypeScript + plain CSS + SVG (no external dependencies)

> **Critical — CSS 变量重命名映射表 (所有 TSX/CSS 文件中必须同步更新)**
>
> | 旧名称 | 新名称 |
> |---------|---------|
> | `--pri` | `--color-primary` |
> | `--pri-bg` | `--color-primary-bg` |
> | `--pri-dk` | `--color-primary-hover` |
> | `--g50` | `--color-gray-50` |
> | `--g100` | `--color-gray-100` |
> | `--g200` | `--color-gray-200` |
> | `--g300` | `--color-gray-300` |
> | `--g500` | `--color-gray-500` |
> | `--g600` | `--color-gray-600` |
> | `--g700` | `--color-gray-700` |
> | `--g800` | `--color-gray-800` |
> | `--g900` | `--color-gray-900` |
> | `--R` | `--radius-lg` |
> | `--Rs` | `--radius-md` |
> | `--sh` | `--shadow-base` |
> | `--sh-md` | `--shadow-md` |
>
> 保持不变：`--pro` `--pro-bg` `--it` `--it-bg` `--hr` `--hr-bg` `--fin` `--fin-bg`

---

### Task 1: 重写 Layout.css — 全局设计 Token + 全部组件样式

**Files:**
- Modify: `frontend/src/components/Layout.css` (完整重写)

- [ ] **Step 1: 完全重写 Layout.css**

用以下完整内容替换 `frontend/src/components/Layout.css`：

```css
/* ===== Design Tokens ===== */
:root {
  /* Primary */
  --color-primary:        #2563EB;
  --color-primary-hover:  #1D4ED8;
  --color-primary-light:  #3B82F6;
  --color-primary-bg:     #EFF6FF;

  /* Domain Colors */
  --color-pro:    #0D9488;
  --color-pro-bg: #F0FDFA;
  --color-it:     #7C3AED;
  --color-it-bg:  #F5F3FF;
  --color-hr:     #D97706;
  --color-hr-bg:  #FFFBEB;
  --color-fin:    #DC2626;
  --color-fin-bg: #FEF2F2;

  /* Semantic */
  --color-success:    #16A34A;
  --color-success-bg: #DCFCE7;
  --color-warning:    #D97706;
  --color-warning-bg: #FEF3C7;
  --color-danger:     #DC2626;
  --color-danger-bg:  #FEE2E2;
  --color-info:       #2563EB;
  --color-info-bg:    #DBEAFE;

  /* Slate Grays */
  --color-gray-50:  #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-300: #CBD5E1;
  --color-gray-400: #94A3B8;
  --color-gray-500: #64748B;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;
  --color-gray-900: #0F172A;

  /* Sidebar */
  --sidebar-bg-start:       #0F1D3A;
  --sidebar-bg-end:         #162D50;
  --sidebar-text:           #94A3B8;
  --sidebar-text-active:    #93C5FD;
  --sidebar-active-bg:      rgba(59, 130, 246, 0.15);
  --sidebar-divider:        rgba(148, 163, 184, 0.1);
  --sidebar-footer:         rgba(148, 163, 184, 0.35);

  /* Type scale (rem) */
  --text-xs:   0.6875rem;
  --text-sm:   0.75rem;
  --text-base: 0.8125rem;
  --text-md:   0.875rem;
  --text-lg:   1rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.75rem;

  /* Spacing (4px base) */
  --space-xs:   0.25rem;
  --space-sm:   0.5rem;
  --space-md:   0.75rem;
  --space-base: 1rem;
  --space-lg:   1.25rem;
  --space-xl:   1.5rem;
  --space-2xl:  2rem;
  --space-3xl:  2.5rem;

  /* Radius */
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-base: 8px;
  --radius-lg:   10px;
  --radius-xl:   12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:    0 1px 2px rgba(0,0,0,0.05);
  --shadow-base:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:    0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:    0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.2);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

/* ===== Reset ===== */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--color-gray-50);
  color: var(--color-gray-800);
  line-height: 1.6;
  min-height: 100vh;
}

/* ===== App Shell ===== */
.app-shell {
  display: flex;
  min-height: 100vh;
}

/* ===== Sidebar ===== */
.sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 240px;
  background: linear-gradient(180deg, var(--sidebar-bg-start), var(--sidebar-bg-end));
  color: var(--sidebar-text);
  z-index: 100;
  display: flex;
  flex-direction: column;
}
.sidebar .logo {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--sidebar-divider);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.sidebar .logo h1 {
  font-size: var(--text-md);
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
}
.sidebar .logo span {
  font-size: var(--text-xs);
  color: var(--sidebar-text);
}
.sidebar nav {
  flex: 1;
  padding: var(--space-md) var(--space-sm);
}
.sidebar nav a {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: var(--text-base);
  border-radius: var(--radius-base);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.sidebar nav a:hover {
  color: #fff;
  background: rgba(255,255,255,0.05);
}
.sidebar nav a.on {
  color: var(--sidebar-text-active);
  background: var(--sidebar-active-bg);
  font-weight: 600;
}
.sidebar nav a svg {
  flex-shrink: 0;
}
.sidebar .ft {
  padding: var(--space-base) var(--space-lg);
  font-size: 10px;
  color: var(--sidebar-footer);
  border-top: 1px solid var(--sidebar-divider);
}

/* ===== Main Layout ===== */
.main {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ===== Topbar ===== */
.topbar {
  background: #fff;
  padding: var(--space-md) var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar h2 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-gray-800);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.topbar h2 svg {
  flex-shrink: 0;
}
.topbar .actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}
.topbar .date {
  font-size: var(--text-sm);
  color: var(--color-gray-400);
}
.topbar-user {
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  font-weight: 600;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ===== Content ===== */
.content {
  padding: var(--space-xl);
  flex: 1;
}

/* ===== Buttons ===== */
.btn {
  padding: var(--space-sm) var(--space-base);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: background var(--transition-base), color var(--transition-base), border-color var(--transition-base);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-primary {
  background: var(--color-primary);
  color: #fff;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn-secondary {
  background: #fff;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-200);
}
.btn-secondary:hover:not(:disabled) { background: var(--color-gray-50); }
.btn-danger {
  background: transparent;
  color: var(--color-danger);
}
.btn-danger:hover:not(:disabled) { background: var(--color-danger-bg); }
.btn-ghost {
  background: transparent;
  color: var(--color-gray-500);
}
.btn-ghost:hover:not(:disabled) { background: var(--color-gray-100); }

/* Backwards compat aliases */
.btn-p { background: var(--color-primary); color: #fff; }
.btn-p:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn-o {
  background: #fff;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-200);
}
.btn-o:hover:not(:disabled) { background: var(--color-gray-50); }

/* ===== KPI Cards ===== */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-base);
  margin-bottom: var(--space-lg);
}
.kpi-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--space-base);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-gray-200);
}
.kpi-card .kl {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  margin-bottom: 6px;
}
.kpi-card .kv {
  font-size: var(--text-2xl);
  font-weight: 800;
  line-height: 1.2;
}
.kpi-card .ks {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
  margin-top: 4px;
}
.kpi-card.c1 { border-left: 3px solid var(--color-pro); }
.kpi-card.c2 { border-left: 3px solid var(--color-it); }
.kpi-card.c3 { border-left: 3px solid var(--color-hr); }
.kpi-card.c4 { border-left: 3px solid var(--color-fin); }

/* ===== Section ===== */
.section {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-gray-200);
  margin-bottom: var(--space-lg);
}
.section .sh {
  padding: var(--space-base) var(--space-lg);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.section .sh h3 {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-gray-800);
}
.section .sh .badge {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-gray-100);
  color: var(--color-gray-500);
}
.section .sb {
  padding: 0;
  overflow-x: auto;
}

/* ===== Tables ===== */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
table thead th {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: 600;
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  background: var(--color-gray-50);
  border-bottom: 2px solid var(--color-gray-200);
  white-space: nowrap;
}
table tbody td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-gray-100);
  vertical-align: middle;
}
table tbody tr:hover { background: var(--color-gray-50); }
table tbody tr:last-child td { border-bottom: none; }
.t-c { text-align: center; }

/* ===== Status Tags ===== */
.stag {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  line-height: 1.6;
}
.stag-done { background: var(--color-success-bg); color: var(--color-success); }
.stag-doing { background: var(--color-warning-bg); color: var(--color-warning); }
.stag-paused { background: var(--color-danger-bg); color: var(--color-danger); }
.stag-todo { background: var(--color-gray-100); color: var(--color-gray-500); }

/* ===== Progress Bar ===== */
.pbar {
  width: 100%;
  max-width: 120px;
  height: 6px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.pbar .pf {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
  background: var(--color-primary);
}

/* ===== Grids ===== */
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-base); }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-base); }

/* ===== Stats Mini ===== */
.stats-mini {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-base);
}
.stats-mini .sm {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  text-align: center;
}
.stats-mini .sm .smv {
  font-size: var(--text-xl);
  font-weight: 800;
  line-height: 1.2;
}
.stats-mini .sm .sml {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  margin-top: 2px;
}

/* ===== Tabs ===== */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-gray-200);
  margin-top: var(--space-base);
}
.tabs button {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  background: none;
  font-size: var(--text-base);
  color: var(--color-gray-500);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-base), border-color var(--transition-base);
}
.tabs button:hover { color: var(--color-gray-700); }
.tabs button.on {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

/* ===== Phase Dots ===== */
.phase-dots {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}
.phase-dots span {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
}
.phase-dots .done { background: var(--color-pro); }
.phase-dots .doing { background: var(--color-hr); }
.phase-dots .todo { background: var(--color-gray-300); color: var(--color-gray-500); }
.phase-dots .plan { background: #E0E7FF; color: #4F46E5; }

/* ===== Alert ===== */
.alert-row {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-base);
}
.alert-item {
  padding: var(--space-sm) var(--space-base);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: 6px;
}
.alert-yellow { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
.alert-blue { background: var(--color-info-bg); color: #1D4ED8; border: 1px solid #BFDBFE; }

/* ===== Dept Tag ===== */
.dept-tag {
  display: inline-block;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

/* ===== Timeline ===== */
.tl-block { padding: var(--space-base) 0; }
.tl-phase {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-200);
}
.tl-phase .tp-h {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.tl-phase .tp-date {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  font-weight: 400;
}
.tl-phase .tp-actions {
  font-size: var(--text-xs);
  color: var(--color-gray-600);
  line-height: 1.8;
}

/* ===== Project Row (clickable) ===== */
.proj-row {
  cursor: pointer;
  transition: background var(--transition-fast);
}
.proj-row:hover { background: var(--color-pro-bg) !important; }

/* ===== Page Transitions ===== */
.page-enter {
  animation: fadeInUp var(--transition-slow) ease;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn var(--transition-base) ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-card {
  background: #fff;
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  width: 400px;
  max-width: 90vw;
  box-shadow: var(--shadow-modal);
}
.modal-card h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-lg);
  color: var(--color-gray-800);
}
.modal-error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-base);
  border: 1px solid #FEE2E2;
}
.modal-success {
  background: var(--color-success-bg);
  color: var(--color-success);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-base);
  border: 1px solid #BBF7D0;
}
.modal-card .field {
  margin-bottom: var(--space-base);
}
.modal-card .field label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-gray-600);
  margin-bottom: 4px;
}
.modal-card .field input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.modal-card .field input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.modal-actions {
  margin-top: var(--space-xl);
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

/* ===== Stat Card (for Linkage summary) ===== */
.stat-card {
  padding: var(--space-base);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-200);
  text-align: center;
}
.stat-num {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-gray-800);
}
.stat-label {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  margin-top: 2px;
}

/* ===== Form Fields (global) ===== */
.form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  background: #fff;
}
.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.form-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-gray-600);
  margin-bottom: 4px;
}
.form-select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  outline: none;
  background: #fff;
}
.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .grid2, .grid3 { grid-template-columns: 1fr; }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .stats-mini { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .sidebar { width: 60px; }
  .sidebar .logo h1,
  .sidebar .logo span,
  .sidebar nav a span,
  .sidebar .ft { display: none; }
  .sidebar nav a { justify-content: center; padding: var(--space-md); }
  .main { margin-left: 60px; }
  .kpi-row { grid-template-columns: 1fr; }
  .stats-mini { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: 验证 CSS 无语法错误**

无需验证命令，纯 CSS 文件重写不涉及构建错误。

---

### Task 2: 创建 Icons.tsx — SVG 图标组件库

**Files:**
- Create: `frontend/src/components/Icons.tsx`

- [ ] **Step 1: 创建 Icons.tsx**

```tsx
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function mkIcon(d: string, fillRule?: 'evenodd') {
  return function Icon({ size = 24, ...props }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d={d} fillRule={fillRule} />
      </svg>
    )
  }
}

/* Navigation & Page Icons */
export const IconDashboard = mkIcon('M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm11 0h7v7h-7v-7z')
export const IconPro = mkIcon('M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2 M8 2h8v4H8V2z')
export const IconIT = mkIcon('M21 16V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2z M8 21h8 M12 17v4')
export const IconHR = mkIcon('M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')
export const IconFin = mkIcon('M22 12a10 10 0 11-20 0 10 10 0 0120 0z M16 8h-6a2 2 0 100 4h4a2 2 0 010 4H8m4-12v16')
export const IconLink = mkIcon('M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.636-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1')
export const IconAdmin = mkIcon('M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z')
export const IconAudit = mkIcon('M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8')

/* Action Icons */
export const IconClock = mkIcon('M12 2a10 10 0 1010 10A10 10 0 0012 2z M12 6v6l4 2')
export const IconSearch = mkIcon('M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z')
export const IconUser = mkIcon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z')
export const IconEdit = mkIcon('M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z')
export const IconDelete = mkIcon('M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2 M10 11v6 M14 11v6')
export const IconAdd = mkIcon('M12 5v14 M5 12h14')
export const IconSave = mkIcon('M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8')
export const IconClose = mkIcon('M18 6L6 18 M6 6l12 12')
export const IconPwd = mkIcon('M12 2a9 9 0 00-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11a9 9 0 00-9-9z M12 7v4l2 2')
```

- [ ] **Step 2: 验证 TypeScript 无编译错误**

```bash
cd D:/code/houqin/frontend && npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No new errors related to Icons.tsx.

---

### Task 3: 更新 Layout.tsx — 引用 SVG 图标

**Files:**
- Modify: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: 更新 import 和侧边栏 Logo**

将文件顶部的 import 替换为：

```tsx
import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/api'
import { IconClock, IconDashboard, IconPro, IconIT, IconHR, IconFin, IconLink, IconAdmin, IconAudit, IconUser, IconPwd } from './Icons'
import './Layout.css'
```

- [ ] **Step 2: 更新 Logo 区**

将 Logo div 替换为：

```tsx
<div className="logo">
  <IconClock size={24} color="#60A5FA" />
  <div>
    <h1>后勤部</h1>
    <span>四项规划统筹管理系统</span>
  </div>
</div>
```

- [ ] **Step 3: 更新导航链接**

将所有 NavLink 替换为使用图标组件：

```tsx
<nav>
  <NavLink to="/dash" end className={({ isActive }) => isActive ? 'on' : ''}>
    <IconDashboard size={16} />驾驶舱总览
  </NavLink>
  {hasPermission('projects:read') && (
    <>
      <NavLink to="/pro" className={({ isActive }) => isActive ? 'on' : ''}>
        <IconPro size={16} />专业项目
      </NavLink>
      <NavLink to="/it" className={({ isActive }) => isActive ? 'on' : ''}>
        <IconIT size={16} />信息化方案
      </NavLink>
    </>
  )}
  {hasPermission('employees:read') && (
    <NavLink to="/hr" className={({ isActive }) => isActive ? 'on' : ''}>
      <IconHR size={16} />人力资源
    </NavLink>
  )}
  {hasPermission('finance:read') && (
    <NavLink to="/fin" className={({ isActive }) => isActive ? 'on' : ''}>
      <IconFin size={16} />财务管控
    </NavLink>
  )}
  <NavLink to="/link" className={({ isActive }) => isActive ? 'on' : ''}>
    <IconLink size={16} />联动配置
  </NavLink>
  {hasPermission('users:read') && (
    <>
      <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'on' : ''}>
        <IconAdmin size={16} />系统管理
      </NavLink>
      <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'on' : ''}>
        <IconAudit size={16} />审计日志
      </NavLink>
    </>
  )}
</nav>
```

- [ ] **Step 4: 更新 Topbar 用户信息**

将 `<span className="topbar-user">` 替换为：

```tsx
<span className="topbar-user">
  <IconUser size={14} />{user.display_name}
</span>
```

- [ ] **Step 5: 更新修改密码按钮**

将修改密码按钮替换为：

```tsx
<button className="btn btn-ghost" onClick={() => setShowPwdModal(true)}>
  <IconPwd size={14} />修改密码
</button>
```

将退出按钮替换为：

```tsx
<button className="btn btn-ghost" onClick={() => { logout(); navigate('/login') }}>退出</button>
```

- [ ] **Step 6: 验证构建**

```bash
cd D:/code/houqin/frontend && npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No new TypeScript errors.

---

### Task 4: 更新 SearchBar.tsx — 替换 emoji 搜索图标

**Files:**
- Modify: `frontend/src/components/SearchBar.tsx`

- [ ] **Step 1: 更新 SearchBar.tsx**

```tsx
import type { KeyboardEvent, ChangeEvent } from 'react'
import { IconSearch, IconClose } from './Icons'

interface SearchBarProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
}

export default function SearchBar({ value, placeholder = '搜索...', onChange, onSearch, onClear }: SearchBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="form-input"
        style={{ width: 220 }}
      />
      <button className="btn btn-secondary" onClick={onSearch}>
        <IconSearch size={14} />搜索
      </button>
      {value && (
        <button className="btn btn-ghost" onClick={onClear}>
          <IconClose size={14} />清除
        </button>
      )}
    </div>
  )
}
```

---

### Task 5: 更新 DashboardPage.tsx — 替换 emoji

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: 添加图标 import**

在文件顶部 import 块添加：

```tsx
import { IconPro, IconIT, IconHR, IconFin } from '../components/Icons'
```

- [ ] **Step 2: 全局替换旧 CSS 变量名**

在 DashboardPage.tsx 中执行以下替换：
- `var(--g500)` → `var(--color-gray-500)`
- `var(--g50)` → `var(--color-gray-50)`（若有）
- `var(--g400)` → `var(--color-gray-400)`（若有）

- [ ] **Step 3: 替换 KPI 卡片中的 emoji**

将四个 KPI 卡片的 kl 文本替换为纯文本（去掉 emoji 前缀）：
- `📋 专业项目总数` → `专业项目总数`
- `💻 信息化子项目` → `信息化子项目`
- `👥 在编人数` → `在编人数`
- `💰 年度预算` → `年度预算`

- [ ] **Step 4: 替换 Section 标题中的 emoji**

将四个 Section title 替换：
- `📋 专业项目进度 (${kpi.proj_count}项)` → `` `专业项目进度 (${kpi.proj_count}项)` ``
- `💻 信息化项目状态 (${kpi.it_count}项)` → `信息化项目状态 (${kpi.it_count}项)`
- `👥 部门项目分布` → `部门项目分布`
- `💰 费用结构总览` → `费用结构总览`

---

### Task 6: 更新 ProfessionalPage.tsx — 替换 emoji + 对齐表单

**Files:**
- Modify: `frontend/src/pages/ProfessionalPage.tsx`

- [ ] **Step 1: 添加图标 import**

```tsx
import { IconAdd, IconSave, IconEdit, IconDelete } from '../components/Icons'
```

- [ ] **Step 2: 全局替换旧 CSS 变量名**

在文件中将所有 `var(--g500)` → `var(--color-gray-500)`，`var(--g200)` → `var(--color-gray-200)`，`var(--g100)` → `var(--color-gray-100)`。

- [ ] **Step 3: 替换所有 emoji**

- `➕ 新增项目` → `<IconAdd size={14} />新增项目`（按钮使用 btn-primary 类）
- `💾 保存` → `<IconSave size={14} />保存`
- `✏️` → `<IconEdit size={14} />`
- `🗑️` → `<IconDelete size={14} />`
- Section title `📋 专业项目清单...` 去掉 emoji 前缀

- [ ] **Step 4: 统一表单输入框样式**

将所有内联表单 input 的 style 替换为 `className="form-input"`，label 类似 `style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}` 替换为 `className="form-label"`。

---

### Task 7: 更新 ITPage.tsx — 替换 emoji

**Files:**
- Modify: `frontend/src/pages/ITPage.tsx`

- [ ] **Step 1: 添加图标 import**

```tsx
import { IconAdd, IconSave, IconEdit, IconDelete } from '../components/Icons'
```

- [ ] **Step 2: 全局替换旧 CSS 变量名**

在文件中将所有 `var(--g500)` → `var(--color-gray-500)`，`var(--g200)` → `var(--color-gray-200)`，`var(--g100)` → `var(--color-gray-100)`。

- [ ] **Step 3: 替换所有 emoji**

与 ProfessionalPage 相同的模式：
- `➕ 新增项目` → `<IconAdd size={14} />新增项目`
- `💾 保存` → `<IconSave size={14} />保存`
- `✏️` → `<IconEdit size={14} />`
- `🗑️` → `<IconDelete size={14} />`
- Section title `💻 信息化细化方案...` 去掉 emoji 前缀
- 按钮 `className="btn"` → 匹配现有样式

- [ ] **Step 4: 统一表单输入框样式**

将内联 input style 替换为 `className="form-input"`，label 替换为 `className="form-label"`。

---

### Task 8: 更新 HRPage.tsx — 替换 emoji

**Files:**
- Modify: `frontend/src/pages/HRPage.tsx`

- [ ] **Step 1: 添加图标 import**

```tsx
import { IconAdd, IconSave, IconEdit, IconDelete } from '../components/Icons'
```

- [ ] **Step 2: 全局替换旧 CSS 变量名**

在文件中将所有 `var(--g500)` → `var(--color-gray-500)`，`var(--g200)` → `var(--color-gray-200)`，`var(--g100)` → `var(--color-gray-100)`。

- [ ] **Step 3: 替换所有 emoji**

- `➕ 新增员工` → `<IconAdd size={14} />新增员工`
- `💾 保存` → `<IconSave size={14} />保存`
- `✏️` → `<IconEdit size={14} />`
- `🗑️` → `<IconDelete size={14} />`
- Section titles: 去掉 `🎓` `📅` `👥` `📋` `📈` `🔄` 前缀
- 统一表单 input className 为 `form-input`，label 为 `form-label`

---

### Task 9: 更新 FinancePage.tsx — 替换 emoji

**Files:**
- Modify: `frontend/src/pages/FinancePage.tsx`

- [ ] **Step 1: 添加图标 import**

```tsx
import { IconAdd, IconSave, IconEdit, IconDelete } from '../components/Icons'
```

- [ ] **Step 2: 全局替换旧 CSS 变量名**

在文件中将所有 `var(--g500)` → `var(--color-gray-500)`，`var(--g200)` → `var(--color-gray-200)`，`var(--g100)` → `var(--color-gray-100)`。

- [ ] **Step 3: 替换所有 emoji**

- `➕ 新增预算项` / `➕ 新增降费项` → `<IconAdd size={14} />新增预算项` 等
- `💾 保存` → `<IconSave size={14} />保存`
- `✏️` → `<IconEdit size={14} />`
- `🗑️` → `<IconDelete size={14} />`
- Section titles: 去掉 `🏗️` `📅` `📉` 前缀
- 统一表单 input className 为 `form-input`，label 为 `form-label`

---

### Task 10: 更新 LinkConfigPage.tsx — 替换 emoji

**Files:**
- Modify: `frontend/src/pages/LinkConfigPage.tsx`

- [ ] **Step 1: 添加图标 import**

```tsx
import { IconAdd, IconSave, IconEdit, IconDelete } from '../components/Icons'
```

- [ ] **Step 2: 全局替换旧 CSS 变量名**

在文件中将所有 `var(--g500)` → `var(--color-gray-500)`，`var(--g200)` → `var(--color-gray-200)`，`var(--g100)` → `var(--color-gray-100)`。

- [ ] **Step 3: 替换所有 emoji**

- `💡` alert 前缀去掉
- `⚡ 测算` → `测算`（或保留闪电 icon）
- `💾 保存` → `<IconSave size={14} />保存`
- `✏️` → `<IconEdit size={14} />`
- `🗑️` → `<IconDelete size={14} />`
- Section titles: 去掉 `🔗` `📊` `🧮` `📋` 前缀
- `+ 新增配置` → `<IconAdd size={14} />新增配置`
- 统一表单 input/select className 为 `form-input` / `form-select`，label 为 `form-label`

---

### Task 11: 更新 LoginPage — 对齐全局 Token

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/LoginPage.css`

- [ ] **Step 1: 更新 LoginPage.tsx — 引入 Logo 图标**

```tsx
import { IconClock } from '../components/Icons'
```

将 `<h1>🔧 后勤部</h1>` 替换为：

```tsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
  <IconClock size={24} color="#60A5FA" />
  <h1>后勤部</h1>
</div>
```

- [ ] **Step 2: 重写 LoginPage.css — 使用 CSS 变量**

```css
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1E293B, #0F172A);
}

.login-card {
  background: #fff;
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  width: 380px;
  box-shadow: var(--shadow-modal);
}

.login-logo {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.login-logo h1 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-gray-800);
}

.login-logo span {
  font-size: var(--text-sm);
  color: var(--color-gray-400);
}

.login-card .field {
  margin-bottom: var(--space-base);
}

.login-card .field label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-gray-600);
  margin-bottom: 4px;
}

.login-card .field input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.login-card .field input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.login-error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-base);
  border: 1px solid #FEE2E2;
}

.login-btn {
  width: 100%;
  padding: var(--space-md);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-base);
}

.login-btn:hover {
  background: var(--color-primary-hover);
}

.login-btn:disabled {
  background: var(--color-gray-400);
  cursor: not-allowed;
}
```

---

### Task 12: 更新 UserManagementPage — 对齐全局 Token

**Files:**
- Modify: `frontend/src/pages/UserManagementPage.tsx`
- Modify: `frontend/src/pages/UserManagementPage.css`

- [ ] **Step 1: 更新 UserManagementPage.tsx — 替换 emoji**

```tsx
import { IconAdmin } from '../components/Icons'
```

- 将 `🔐 系统管理` 替换为使用图标：`<><IconAdmin size={20} />系统管理</>`
- 去掉 tabs emoji：`👤 用户管理` → `用户管理`，`🔑 角色管理` → `角色管理`
- 按钮样式对齐：将 `className="btn btn-p"` → `className="btn btn-primary"`，`className="btn btn-o"` → `className="btn btn-secondary"`

- [ ] **Step 2: 重写 UserManagementPage.css — 使用 CSS 变量**

```css
.um-page {
  max-width: 1100px;
}

.um-header h2 {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-gray-800);
}

.um-content {
  margin-top: var(--space-base);
}

.um-form-card {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-base);
  padding: var(--space-lg);
  margin-bottom: var(--space-base);
}

.um-form-card h4 {
  font-size: var(--text-base);
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--color-gray-800);
}

.um-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.um-form-actions {
  margin-top: var(--space-base);
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.um-checkbox-group {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.um-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  cursor: pointer;
  color: var(--color-gray-700);
}

.um-checkbox input {
  margin: 0;
}

.um-perm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: var(--space-sm);
}

.um-perm-grid .um-checkbox {
  padding: 6px 8px;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.um-perm-code {
  font-weight: 600;
  color: var(--color-gray-700);
  margin-right: 4px;
  font-family: monospace;
}

.um-perm-name {
  color: var(--color-gray-500);
}
```

---

### Task 13: 更新 AuditLogPage — 对齐全局 Token

**Files:**
- Modify: `frontend/src/pages/AuditLogPage.tsx`
- Modify: `frontend/src/pages/AuditLogPage.css`

- [ ] **Step 1: 更新 AuditLogPage.tsx — 替换 emoji**

```tsx
import { IconAudit } from '../components/Icons'
```

- 将 `📋 审计日志` 替换为：`<><IconAudit size={20} />审计日志</>`

- [ ] **Step 2: 重写 AuditLogPage.css — 使用 CSS 变量**

```css
.audit-page {
  max-width: 1200px;
}

.audit-count {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-left: var(--space-md);
}

.audit-filters {
  display: flex;
  gap: var(--space-sm);
  margin: var(--space-base) 0;
  flex-wrap: wrap;
}

.audit-select, .audit-input {
  padding: 7px var(--space-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  outline: none;
  background: #fff;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.audit-select:focus, .audit-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.audit-input {
  min-width: 160px;
}

.audit-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  line-height: 1.6;
}

.audit-login { background: var(--color-info-bg); color: #1D4ED8; }
.audit-fail { background: var(--color-danger-bg); color: var(--color-danger); }
.audit-create { background: var(--color-success-bg); color: var(--color-success); }
.audit-update { background: var(--color-warning-bg); color: var(--color-warning); }
.audit-delete { background: var(--color-danger-bg); color: var(--color-danger); }
.audit-export { background: #E0E7FF; color: #4F46E5; }

.audit-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-base);
  margin-top: var(--space-base);
  padding: var(--space-md);
}

.audit-pager button {
  padding: 6px var(--space-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  background: #fff;
  font-size: var(--text-sm);
  cursor: pointer;
  color: var(--color-gray-600);
  transition: background var(--transition-fast);
}

.audit-pager button:disabled {
  color: var(--color-gray-300);
  cursor: not-allowed;
}

.audit-pager button:hover:not(:disabled) {
  background: var(--color-gray-100);
}

.audit-pager span {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}
```

---

### Task 14: 更新 StatusTag.tsx — 对齐新 class 名

**Files:**
- Modify: `frontend/src/components/StatusTag.tsx`

- [ ] **Step 1: 验证 StatusTag 无需改动**

StatusTag.tsx 使用的 class 名 `stag-done`, `stag-doing`, `stag-paused`, `stag-todo` 在 Layout.css 重写后保持不变，无需修改。

（跳过，无需更改）

---

### Task 15: 构建验证 + 视觉一致性检查

**Files:** 无新文件

- [ ] **Step 1: TypeScript 编译检查**

```bash
cd D:/code/houqin/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Vite 构建检查**

```bash
cd D:/code/houqin/frontend && npx vite build
```

Expected: Build succeeds without errors.

- [ ] **Step 3: 全局检查清单**

逐项确认以下内容：
1. 所有 CSS 变量已从旧命名 (`--pri`, `--g50` 等) 迁移到新命名 (`--color-primary`, `--color-gray-50` 等)
2. 所有 emoji 图标已替换为 Icons.tsx 中的 SVG 组件
3. 所有页面 CSS 文件已对齐新的 CSS 变量
4. 表单输入 box 统一使用 `class="form-input"`
5. 表单标签统一使用 `class="form-label"`
6. 按钮使用正确的变体 class（`btn-primary`, `btn-secondary`, `btn-danger`, `btn-ghost`）
7. 页面背景为 `var(--color-gray-50)` (#F8FAFC)，卡片为白色
8. 侧边栏为品牌蓝渐变 `#0F1D3A → #162D50`
9. 响应式断点 1200px / 768px 正常工作

- [ ] **Step 4: 提交所有更改**

```bash
cd D:/code/houqin
git add frontend/
git commit -m "feat: UI 设计规范 v2.0 全面实施

- 重写 Layout.css：15 组设计 Token + 12 类组件样式
- 新建 Icons.tsx：20 个 SVG 图标组件
- Layout.tsx/所有页面 TSX：emoji 替换为 SVG 图标
- LoginPage.css/UserManagementPage.css/AuditLogPage.css：对齐全局 CSS 变量
- 统一表单输入框/标签/按钮 class 体系
- 侧边栏改为品牌蓝深色渐变 (#0F1D3A→#162D50)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
"
```
