import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { IconAudit } from '../components/Icons'
import Pagination from '../components/Pagination'
import './AuditLogPage.css'

interface AuditLog {
  id: number
  username: string
  display_name: string
  action: string
  resource: string
  resource_id: string | null
  detail: string | null
  ip_address: string | null
  created_at: string
}

const ACTION_LABELS: Record<string, { label: string; cls: string }> = {
  LOGIN: { label: '登录', cls: 'audit-login' },
  LOGIN_FAIL: { label: '登录失败', cls: 'audit-fail' },
  CREATE: { label: '新增', cls: 'audit-create' },
  UPDATE: { label: '编辑', cls: 'audit-update' },
  DELETE: { label: '删除', cls: 'audit-delete' },
  EXPORT: { label: '导出', cls: 'audit-export' },
}

function getToken() { return localStorage.getItem('token') }

export default function AuditLogPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [usernameFilter, setUsernameFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
      if (actionFilter) params.set('action', actionFilter)
      if (resourceFilter) params.set('resource', resourceFilter)
      if (usernameFilter) params.set('username', usernameFilter)
      const res = await fetch(`/api/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      setLogs(data.data)
      setTotal(data.total)
    } catch { /* */
    } finally { setLoading(false) }
  }, [page, pageSize, actionFilter, resourceFilter, usernameFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  useEffect(() => { setPage(1) }, [actionFilter, resourceFilter, usernameFilter])

  const totalPages = Math.ceil(total / pageSize)
  if (!user) return null

  const handlePageChange = (p: number, ps: number) => {
    setPage(p)
    if (ps !== pageSize) {
      // handled via state + useEffect
    }
  }

  return (
    <div className="audit-page">
      <div className="um-header">
        <h2><IconAudit size={20} />审计日志</h2>
        <span className="audit-count">共 {total} 条记录</span>
      </div>

      <div className="audit-filters">
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="audit-select">
          <option value="">全部操作</option>
          <option value="LOGIN">登录</option>
          <option value="LOGIN_FAIL">登录失败</option>
          <option value="CREATE">新增</option>
          <option value="UPDATE">编辑</option>
          <option value="DELETE">删除</option>
          <option value="EXPORT">导出</option>
        </select>
        <select value={resourceFilter} onChange={e => setResourceFilter(e.target.value)} className="audit-select">
          <option value="">全部资源</option>
          <option value="auth">认证</option>
          <option value="projects">项目</option>
          <option value="employees">人员</option>
          <option value="hr_kpi">人力KPI</option>
          <option value="finance">财务</option>
          <option value="users">用户管理</option>
          <option value="roles">角色管理</option>
        </select>
        <input
          type="text"
          placeholder="搜索用户名..."
          value={usernameFilter}
          onChange={e => setUsernameFilter(e.target.value)}
          className="audit-input"
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-gray-500)' }}>加载中...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th style={{ width: 100 }}>操作时间</th>
                <th style={{ width: 80 }}>操作人</th>
                <th style={{ width: 80 }}>操作类型</th>
                <th style={{ width: 80 }}>资源</th>
                <th>详情</th>
                <th style={{ width: 110 }}>IP 地址</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const ac = ACTION_LABELS[log.action] || { label: log.action, cls: '' }
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>{log.id}</td>
                    <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{log.created_at}</td>
                    <td>{log.display_name}</td>
                    <td><span className={`audit-tag ${ac.cls}`}>{ac.label}</span></td>
                    <td><span className="dept-tag">{log.resource}</span></td>
                    <td style={{ fontSize: 12 }}>{log.detail || '-'}</td>
                    <td style={{ fontSize: 11, color: 'var(--color-gray-400)', fontFamily: 'monospace' }}>{log.ip_address || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <Pagination page={page} pageSize={pageSize} total={total} onChange={(p: number) => { setPage(p); }} />
          )}
        </>
      )}
    </div>
  )
}
