import { useState, useEffect, useCallback } from 'react'
import { rbacApi, type UserItem, type RoleItem, type PermissionItem } from '../services/api'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import './UserManagementPage.css'

export default function UserManagementPage() {
  const [tab, setTab] = useState<'users' | 'roles'>('users')
  const [users, setUsers] = useState<UserItem[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userPageSize, setUserPageSize] = useState(20)
  const [userTotal, setUserTotal] = useState(0)

  const [roleSearch, setRoleSearch] = useState('')
  const [rolePage, setRolePage] = useState(1)
  const [rolePageSize, setRolePageSize] = useState(20)
  const [roleTotal, setRoleTotal] = useState(0)

  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [userForm, setUserForm] = useState({ username: '', password: '', display_name: '', role_ids: [] as number[] })

  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null)
  const [roleForm, setRoleForm] = useState({ code: '', name: '', description: '', permission_ids: [] as number[] })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [usersData, rolesData, permsData] = await Promise.all([
        rbacApi.getUsers(userPage, userPageSize, userSearch),
        rbacApi.getRoles(rolePage, rolePageSize, roleSearch),
        rbacApi.getPermissions(),
      ])
      setUsers(usersData.data)
      setUserTotal(usersData.total)
      setRoles(rolesData.data)
      setRoleTotal(rolesData.total)
      setPermissions(permsData)
    } catch {
      setError('加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [userPage, userPageSize, userSearch, rolePage, rolePageSize, roleSearch])

  useEffect(() => { loadData() }, [loadData])

  const handleUserSearch = () => { setUserPage(1); loadData() }
  const handleUserClear = () => { setUserSearch(''); setUserPage(1); setTimeout(() => loadData(), 0) }
  const handleUserPageChange = (p: number, ps: number) => { setUserPage(p); setUserPageSize(ps) }

  const handleRoleSearch = () => { setRolePage(1); loadData() }
  const handleRoleClear = () => { setRoleSearch(''); setRolePage(1); setTimeout(() => loadData(), 0) }
  const handleRolePageChange = (p: number, ps: number) => { setRolePage(p); setRolePageSize(ps) }

  const resetUserForm = () => {
    setUserForm({ username: '', password: '', display_name: '', role_ids: [] })
    setEditingUser(null)
    setShowUserForm(false)
  }

  const openEditUser = (u: UserItem) => {
    setEditingUser(u)
    setUserForm({
      username: u.username,
      password: '',
      display_name: u.display_name,
      role_ids: u.roles.map(r => r.id),
    })
    setShowUserForm(true)
  }

  const saveUser = async () => {
    if (!userForm.username || (!editingUser && !userForm.password) || !userForm.display_name) {
      setError('请填写必填项')
      return
    }
    try {
      if (editingUser) {
        const data: Record<string, unknown> = { display_name: userForm.display_name, role_ids: userForm.role_ids }
        if (userForm.password) data.password = userForm.password
        await rbacApi.updateUser(editingUser.id, data)
      } else {
        await rbacApi.createUser(userForm)
      }
      resetUserForm()
      await loadData()
    } catch {
      setError('保存失败')
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('确定删除此用户？')) return
    try {
      await rbacApi.deleteUser(id)
      await loadData()
    } catch {
      setError('删除失败')
    }
  }

  const resetRoleForm = () => {
    setRoleForm({ code: '', name: '', description: '', permission_ids: [] })
    setEditingRole(null)
    setShowRoleForm(false)
  }

  const openEditRole = (r: RoleItem) => {
    setEditingRole(r)
    setRoleForm({
      code: r.code,
      name: r.name,
      description: r.description || '',
      permission_ids: r.permissions.map(p => p.id),
    })
    setShowRoleForm(true)
  }

  const saveRole = async () => {
    if (!roleForm.code || !roleForm.name) {
      setError('请填写必填项')
      return
    }
    try {
      if (editingRole) {
        await rbacApi.updateRole(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description,
          permission_ids: roleForm.permission_ids,
        })
      } else {
        await rbacApi.createRole(roleForm)
      }
      resetRoleForm()
      await loadData()
    } catch {
      setError('保存失败')
    }
  }

  const deleteRole = async (id: number) => {
    if (!confirm('确定删除此角色？关联的用户将失去这些权限。')) return
    try {
      await rbacApi.deleteRole(id)
      await loadData()
    } catch {
      setError('删除失败')
    }
  }

  const togglePermission = (pid: number) => {
    setRoleForm(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(pid)
        ? prev.permission_ids.filter(id => id !== pid)
        : [...prev.permission_ids, pid],
    }))
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>加载中...</div>

  return (
    <div className="um-page">
      <div className="um-header">
        <h2>🔐 系统管理</h2>
      </div>

      {error && <div className="alert-row"><div className="alert-item alert-yellow">{error}</div></div>}

      <div className="tabs">
        <button className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>👤 用户管理</button>
        <button className={tab === 'roles' ? 'on' : ''} onClick={() => setTab('roles')}>🔑 角色管理</button>
      </div>

      {tab === 'users' && (
        <div className="um-content">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
            <SearchBar value={userSearch} placeholder="搜索用户名 / 显示名称..." onChange={setUserSearch} onSearch={handleUserSearch} onClear={handleUserClear} />
            <div style={{ flex: 1 }} />
            <button className="btn btn-p" onClick={() => { resetUserForm(); setShowUserForm(true) }}>+ 新增用户</button>
          </div>

          {showUserForm && (
            <div className="um-form-card">
              <h4>{editingUser ? '编辑用户' : '新增用户'}</h4>
              <div className="um-form-grid">
                <div className="field">
                  <label>用户名 *</label>
                  <input value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} disabled={!!editingUser} />
                </div>
                <div className="field">
                  <label>密码 {!editingUser && '*'}</label>
                  <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder={editingUser ? '留空不修改' : ''} />
                </div>
                <div className="field">
                  <label>显示名称 *</label>
                  <input value={userForm.display_name} onChange={e => setUserForm({ ...userForm, display_name: e.target.value })} />
                </div>
                <div className="field">
                  <label>角色</label>
                  <div className="um-checkbox-group">
                    {roles.map(r => (
                      <label key={r.id} className="um-checkbox">
                        <input
                          type="checkbox"
                          checked={userForm.role_ids.includes(r.id)}
                          onChange={() => {
                            setUserForm(prev => ({
                              ...prev,
                              role_ids: prev.role_ids.includes(r.id)
                                ? prev.role_ids.filter(id => id !== r.id)
                                : [...prev.role_ids, r.id],
                            }))
                          }}
                        />
                        {r.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="um-form-actions">
                <button className="btn btn-p" onClick={saveUser}>保存</button>
                <button className="btn btn-o" onClick={resetUserForm}>取消</button>
              </div>
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>显示名称</th>
                <th>角色</th>
                <th>状态</th>
                <th>创建时间</th>
                <th className="t-c">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.display_name}</td>
                  <td>
                    {u.roles.map(r => (
                      <span key={r.id} className="stag stag-doing" style={{ marginRight: 4 }}>{r.name}</span>
                    ))}
                  </td>
                  <td><span className={`stag ${u.is_active ? 'stag-done' : 'stag-paused'}`}>{u.is_active ? '启用' : '禁用'}</span></td>
                  <td style={{ fontSize: 11, color: '#6B7280' }}>{u.created_at}</td>
                  <td className="t-c">
                    <button className="btn btn-o" style={{ marginRight: 6 }} onClick={() => openEditUser(u)}>编辑</button>
                    <button className="btn btn-o" style={{ color: '#DC2626' }} onClick={() => deleteUser(u.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={userPage} pageSize={userPageSize} total={userTotal} onChange={handleUserPageChange} />
        </div>
      )}

      {tab === 'roles' && (
        <div className="um-content">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
            <SearchBar value={roleSearch} placeholder="搜索角色代码 / 名称..." onChange={setRoleSearch} onSearch={handleRoleSearch} onClear={handleRoleClear} />
            <div style={{ flex: 1 }} />
            <button className="btn btn-p" onClick={() => { resetRoleForm(); setShowRoleForm(true) }}>+ 新增角色</button>
          </div>

          {showRoleForm && (
            <div className="um-form-card">
              <h4>{editingRole ? '编辑角色' : '新增角色'}</h4>
              <div className="um-form-grid">
                <div className="field">
                  <label>角色代码 *</label>
                  <input value={roleForm.code} onChange={e => setRoleForm({ ...roleForm, code: e.target.value })} disabled={!!editingRole} placeholder="小写英文，如 hr_manager" />
                </div>
                <div className="field">
                  <label>角色名称 *</label>
                  <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} />
                </div>
                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <label>描述</label>
                  <input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label>权限分配</label>
                <div className="um-perm-grid">
                  {permissions.map(p => (
                    <label key={p.id} className="um-checkbox">
                      <input
                        type="checkbox"
                        checked={roleForm.permission_ids.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                      />
                      <span className="um-perm-code">{p.code}</span>
                      <span className="um-perm-name">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="um-form-actions">
                <button className="btn btn-p" onClick={saveRole}>保存</button>
                <button className="btn btn-o" onClick={resetRoleForm}>取消</button>
              </div>
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>代码</th>
                <th>名称</th>
                <th>描述</th>
                <th>权限</th>
                <th className="t-c">操作</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td><code>{r.code}</code></td>
                  <td>{r.name}</td>
                  <td style={{ fontSize: 11, color: '#6B7280' }}>{r.description || '-'}</td>
                  <td>
                    {r.permissions.map(p => (
                      <span key={p.id} className="stag stag-done" style={{ marginRight: 3, marginBottom: 3 }}>{p.code}</span>
                    ))}
                  </td>
                  <td className="t-c">
                    <button className="btn btn-o" style={{ marginRight: 6 }} onClick={() => openEditRole(r)}>编辑</button>
                    <button className="btn btn-o" style={{ color: '#DC2626' }} onClick={() => deleteRole(r.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={rolePage} pageSize={rolePageSize} total={roleTotal} onChange={handleRolePageChange} />
        </div>
      )}
    </div>
  )
}
