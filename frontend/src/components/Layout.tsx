import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, hasPermission } = useAuth()
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <h1>🔧 后勤部</h1>
          <span>四项规划统筹管理系统</span>
        </div>
        <nav>
          <NavLink to="/dash" end className={({ isActive }) => isActive ? 'on' : ''}>
            <span className="dot dot-c1" />📊 驾驶舱总览
          </NavLink>
          {hasPermission('projects:read') && (
            <>
              <NavLink to="/pro" className={({ isActive }) => isActive ? 'on' : ''}>
                <span className="dot dot-c1" />📋 专业项目
              </NavLink>
              <NavLink to="/it" className={({ isActive }) => isActive ? 'on' : ''}>
                <span className="dot dot-c2" />💻 信息化方案
              </NavLink>
            </>
          )}
          {hasPermission('employees:read') && (
            <NavLink to="/hr" className={({ isActive }) => isActive ? 'on' : ''}>
              <span className="dot dot-c3" />👥 人力资源
            </NavLink>
          )}
          {hasPermission('finance:read') && (
            <NavLink to="/fin" className={({ isActive }) => isActive ? 'on' : ''}>
              <span className="dot dot-c4" />💰 财务管控
            </NavLink>
          )}
          <NavLink to="/link" className={({ isActive }) => isActive ? 'on' : ''}>
            <span className="dot" style={{ background: 'transparent' }}>🔗</span>联动配置
          </NavLink>
          {hasPermission('users:read') && (
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'on' : ''}>
              <span className="dot" style={{ background: '#8B5CF6' }}>🔐</span>系统管理
            </NavLink>
          )}
        </nav>
        <div className="ft">宝士制冷 · 后勤部 · v1.0</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h2 id="pageTitle">📊 驾驶舱总览</h2>
          <div className="actions">
            <span className="date">{today}</span>
            {user && (
              <>
                <span className="topbar-user">👤 {user.display_name}</span>
                <button className="btn btn-o" onClick={() => { logout(); navigate('/login') }}>退出</button>
              </>
            )}
          </div>
        </header>
        <div className="content">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
