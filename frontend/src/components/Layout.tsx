import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/api'
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

  const [showPwdModal, setShowPwdModal] = useState(false)
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  const handleChangePassword = async () => {
    setPwdError('')
    setPwdSuccess('')
    if (!pwdForm.oldPassword) {
      setPwdError('请输入原密码')
      return
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError('新密码长度不能少于6位')
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('两次输入的新密码不一致')
      return
    }
    setPwdLoading(true)
    try {
      await authApi.changePassword(pwdForm.oldPassword, pwdForm.newPassword)
      setPwdSuccess('密码修改成功')
      setTimeout(() => {
        setShowPwdModal(false)
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setPwdSuccess('')
      }, 1500)
    } catch (e: unknown) {
      setPwdError(e instanceof Error ? e.message : '修改失败')
    } finally {
      setPwdLoading(false)
    }
  }

  const closePwdModal = () => {
    setShowPwdModal(false)
    setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setPwdError('')
    setPwdSuccess('')
  }

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
            <>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'on' : ''}>
                <span className="dot" style={{ background: '#8B5CF6' }}>🔐</span>系统管理
              </NavLink>
              <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'on' : ''}>
                <span className="dot" style={{ background: '#06B6D4' }}>📋</span>审计日志
              </NavLink>
            </>
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
                <button className="btn btn-o" onClick={() => setShowPwdModal(true)}>修改密码</button>
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

      {showPwdModal && (
        <div className="modal-overlay" onClick={closePwdModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>修改密码</h3>
            {pwdError && <div className="modal-error">{pwdError}</div>}
            {pwdSuccess && <div className="modal-success">{pwdSuccess}</div>}
            <div className="field">
              <label>原密码</label>
              <input
                type="password"
                value={pwdForm.oldPassword}
                onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                placeholder="请输入原密码"
              />
            </div>
            <div className="field">
              <label>新密码</label>
              <input
                type="password"
                value={pwdForm.newPassword}
                onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                placeholder="至少6位"
              />
            </div>
            <div className="field">
              <label>确认新密码</label>
              <input
                type="password"
                value={pwdForm.confirmPassword}
                onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                placeholder="再次输入新密码"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-p" onClick={handleChangePassword} disabled={pwdLoading}>
                {pwdLoading ? '修改中...' : '确认修改'}
              </button>
              <button className="btn btn-o" onClick={closePwdModal}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
