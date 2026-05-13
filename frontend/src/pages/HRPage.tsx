import { useEffect, useState } from 'react'
import Section from '../components/Section'
import Tabs from '../components/Tabs'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import { api, type Employee, type HRDistributions, type HRPlanItem, type HRChangeItem } from '../services/api'

const hrTabs = [
  { key: 'overview', label: '团队现状' },
  { key: 'plan', label: '年度KPI规划' },
  { key: 'change', label: '人员调整轨迹' },
]

type HRTabKey = 'overview' | 'plan' | 'change'

const emptyEmployee = {
  name: '', post: '', department_name: '', education: '',
  age: undefined as number | undefined, entry_date: '', professional_match: '', gender: '', status: '在岗',
}

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<HRTabKey>('overview')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [dist, setDist] = useState<HRDistributions | null>(null)
  const [planKPI, setPlanKPI] = useState<HRPlanItem[]>([])
  const [changes, setChanges] = useState<HRChangeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({ ...emptyEmployee })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)

  const load = () => {
    Promise.all([
      api.getEmployees(page, pageSize, search),
      api.getHRDistributions(),
      api.getHRPlanKPI(),
      api.getHRMonthlyChanges(),
    ]).then(([empRes, distRes, planRes, changeRes]) => {
      setEmployees(empRes.data)
      setTotal(empRes.total)
      setDist(distRes)
      setPlanKPI(planRes)
      setChanges(changeRes)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, pageSize])

  const handleSearch = () => {
    setPage(1)
    load()
  }

  const handleClear = () => {
    setSearch('')
    setPage(1)
    setTimeout(() => load(), 0)
  }

  const handlePageChange = (p: number, ps: number) => {
    setPage(p)
    setPageSize(ps)
  }

  const openCreate = () => {
    setForm({ ...emptyEmployee })
    setEditing({ _new: true })
  }

  const openEdit = (emp: Employee) => {
    setForm({
      name: emp.name || '',
      post: emp.post || '',
      department_name: emp.dept || '',
      education: emp.edu || '',
      age: emp.age || undefined,
      entry_date: '',
      professional_match: emp.match || '',
      gender: emp.gender || '',
      status: '在岗',
    })
    setEditing({ _id: emp.id })
  }

  const handleSave = async () => {
    const data = { ...form }
    if (editing?._new) {
      await api.createEmployee(data)
    } else if (editing?._id) {
      await api.updateEmployee(editing._id as number, data)
    }
    setEditing(null)
    load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除此员工？相关月度状态记录也将一并删除。')) {
      await api.deleteEmployee(id)
      load()
    }
  }

  const setF = (k: string, v: unknown) => setForm({ ...form, [k]: v })

  const STATUS_OPTIONS = ['在岗', '新增', '调岗', '优化']
  const statusColor: Record<string, string> = {
    '在岗': 'var(--g400)',
    '新增': 'var(--pro)',
    '调岗': 'var(--it)',
    '优化': 'var(--fin)',
  }

  const handleMonthChange = async (name: string, month: number, status: string) => {
    const key = `m${month}` as keyof HRChangeItem
    setChanges(prev => prev.map(c => c.name === name ? { ...c, [key]: status } : c))
    try {
      await api.updateMonthlyStatus(name, month, status)
    } catch {
      load()
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--g500)' }}>加载中...</div>

  return (
    <div>
      <Tabs tabs={hrTabs} active={activeTab} onChange={(k) => setActiveTab(k as HRTabKey)} />

      {activeTab === 'overview' && dist && (
        <div className="page-enter">
          <div className="stats-mini" style={{ marginTop: 16 }}>
            <div className="sm" style={{ background: 'var(--pro-bg)' }}>
              <div className="smv" style={{ color: 'var(--pro)' }}>
                {dist.summary.total}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>人</span>
              </div>
              <div className="sml">在编人数</div>
            </div>
            <div className="sm" style={{ background: 'var(--it-bg)' }}>
              <div className="smv" style={{ color: 'var(--it)' }}>
                {dist.summary.avg_age}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>岁</span>
              </div>
              <div className="sml">平均年龄</div>
            </div>
            <div className="sm" style={{ background: 'var(--hr-bg)' }}>
              <div className="smv" style={{ color: 'var(--hr)' }}>
                {dist.summary.avg_service}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>年</span>
              </div>
              <div className="sml">平均司龄</div>
            </div>
            <div className="sm" style={{ background: 'var(--fin-bg)' }}>
              <div className="smv" style={{ color: 'var(--fin)' }}>
                {dist.summary.above_bachelor_pct}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>%</span>
              </div>
              <div className="sml">本科以上</div>
            </div>
          </div>

          <div className="grid3">
            <Section title="🎓 学历分布">
              <table>
                <thead>
                  <tr><th>学历</th><th className="t-c">人数</th><th className="t-c">占比</th></tr>
                </thead>
                <tbody>
                  {dist.education.map((d) => (
                    <tr key={d.label}><td>{d.label}</td><td className="t-c">{d.count}</td><td className="t-c">{d.rate}</td></tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section title="📅 年龄分布">
              <table>
                <thead>
                  <tr><th>年龄段</th><th className="t-c">人数</th><th className="t-c">占比</th></tr>
                </thead>
                <tbody>
                  {dist.age.map((d) => (
                    <tr key={d.label}><td>{d.label}</td><td className="t-c">{d.count}</td><td className="t-c">{d.rate}</td></tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section title="👥 男女比例">
              <table>
                <thead>
                  <tr><th>性别</th><th className="t-c">人数</th><th className="t-c">占比</th></tr>
                </thead>
                <tbody>
                  {dist.gender.map((d) => (
                    <tr key={d.label}><td>{d.label}</td><td className="t-c">{d.count}</td><td className="t-c">{d.rate}</td></tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, marginTop: 12, gap: 8 }}>
            <SearchBar value={search} placeholder="搜索姓名 / 部门 / 职务..." onChange={setSearch} onSearch={handleSearch} onClear={handleClear} />
            <div style={{ flex: 1 }} />
            <button className="btn" onClick={openCreate}>➕ 新增员工</button>
          </div>

          {editing && (
            <Section title={editing._new ? '新增员工' : '编辑员工'} actions={
              <div>
                <button className="btn" onClick={handleSave} style={{ marginRight: 8 }}>💾 保存</button>
                <button className="btn btn-o" onClick={() => setEditing(null)}>取消</button>
              </div>
            }>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 16 }}>
                {[
                  ['name', '姓名'],
                  ['post', '职务'],
                  ['department_name', '部门'],
                  ['education', '学历'],
                  ['professional_match', '专业匹配'],
                  ['gender', '性别'],
                  ['status', '状态'],
                ].map(([k, label]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}>{label}</div>
                    <input
                      value={form[k] as string || ''}
                      onChange={e => setF(k, e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--g200)', borderRadius: 4, fontSize: 13 }}
                    />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}>年龄</div>
                  <input
                    type="number"
                    value={form.age as number || ''}
                    onChange={e => setF('age', parseInt(e.target.value) || undefined)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--g200)', borderRadius: 4, fontSize: 13 }}
                  />
                </div>
              </div>
            </Section>
          )}

          <Section title="📋 人员名册 (来源: 后勤部-人力.xlsx)" badge={`${total}人`}>
            <table>
              <thead>
                <tr>
                  <th>姓名</th><th>职务</th><th>部门</th><th>学历</th>
                  <th className="t-c">年龄</th><th className="t-c">司龄(年)</th><th>专业匹配</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td><td>{p.post}</td><td>{p.dept}</td><td>{p.edu}</td>
                    <td className="t-c">{p.age}</td><td className="t-c">{p.service}</td><td>{p.match || '-'}</td>
                    <td>
                      <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', marginRight: 4 }} onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--fin)' }} onClick={() => handleDelete(p.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={total} onChange={handlePageChange} />
          </Section>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="page-enter">
          <Section title="📈 2026年人力规划KPI · 逐月 (来源: 后勤部-人力.xlsx)">
            <table>
              <thead>
                <tr>
                  <th>指标</th><th>目标</th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} className="t-c">{i + 1}月</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planKPI.map((p) => (
                  <tr key={p.item}>
                    <td>{p.item}</td>
                    <td className="t-c">{p.target}</td>
                    {p.data.map((v, j) => (
                      <td key={j} className="t-c">{v}</td>
                    ))}
                  </tr>
                ))}
                {planKPI.length === 0 && (
                  <tr><td colSpan={14} style={{ textAlign: 'center', color: 'var(--g500)', padding: 20 }}>暂无KPI数据</td></tr>
                )}
              </tbody>
            </table>
          </Section>
        </div>
      )}

      {activeTab === 'change' && (
        <div className="page-enter">
          <Section title="🔄 人员调整月度轨迹 (来源: 后勤部-人力.xlsx)" badge={`${changes.length}人`}>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, background: 'var(--g50)', zIndex: 1, minWidth: 60 }}>姓名</th>
                    <th>部门</th>
                    <th>职务</th>
                    {Array.from({ length: 12 }, (_, i) => (
                      <th key={i} className="t-c" style={{ minWidth: 70 }}>{i + 1}月</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {changes.map((p) => (
                    <tr key={p.name}>
                      <td style={{ position: 'sticky', left: 0, background: 'var(--g50)', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.name}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{p.dept}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{p.post}</td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const mk = `m${i + 1}` as keyof HRChangeItem
                        const val = p[mk] as string
                        return (
                          <td key={i} className="t-c" style={{ padding: 2 }}>
                            <select
                              value={val}
                              onChange={e => handleMonthChange(p.name, i + 1, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '2px 4px',
                                border: '1px solid var(--g200)',
                                borderRadius: 4,
                                fontSize: 12,
                                color: statusColor[val] || 'var(--g500)',
                                fontWeight: val !== '在岗' ? 600 : 400,
                                background: val !== '在岗' ? `${statusColor[val]}10` : '#fff',
                                cursor: 'pointer',
                              }}
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {changes.length === 0 && (
                    <tr><td colSpan={15} style={{ textAlign: 'center', color: 'var(--g500)', padding: 20 }}>暂无人员调整记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}
