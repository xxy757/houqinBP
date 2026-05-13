import { useEffect, useState } from 'react'
import Section from '../components/Section'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import { api, type LinkMapping, type LinkageSummary, type ProfessionalProject, type ITProject, type ImpactSimulation } from '../services/api'
import { IconAdd, IconSave, IconEdit, IconDelete } from '../components/Icons'

const PER_PERSON_COST = 10.2

const emptyForm = {
  proj_id: null as number | null,
  it_ids: [] as number[],
  hr_change_desc: '',
  hr_headcount: 0,
  hr_posts: '',
  hr_month_start: null as number | null,
  hr_month_end: null as number | null,
  fin_budget_impact: 0,
  fin_subjects: [] as string[],
  fin_description: '',
  responsible_person: '',
}

export default function LinkConfigPage() {
  const [mappings, setMappings] = useState<LinkMapping[]>([])
  const [summary, setSummary] = useState<LinkageSummary | null>(null)
  const [projList, setProjList] = useState<ProfessionalProject[]>([])
  const [itList, setItList] = useState<ITProject[]>([])
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({ ...emptyForm })
  const [simResult, setSimResult] = useState<ImpactSimulation | null>(null)
  const [simProjId, setSimProjId] = useState<number | null>(null)
  const [simHrChange, setSimHrChange] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)

  const setF = (k: string, v: unknown) => setForm({ ...form, [k]: v })

  const load = () => {
    setLoading(true)
    Promise.all([
      api.getLinkageMappings(page, pageSize, search),
      api.getLinkageSummary(),
      api.getProfessionalProjects(1, 500),
      api.getITProjects(1, 500),
    ]).then(([m, s, p, i]) => {
      setMappings(m.data)
      setTotal(m.total)
      setSummary(s)
      setProjList(p.data)
      setItList(i.data)
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
    setForm({ ...emptyForm })
    setEditing({ _new: true })
  }

  const openEdit = (m: LinkMapping) => {
    setForm({
      proj_id: m.proj_id,
      it_ids: m.it_ids || [],
      hr_change_desc: m.hr_change_desc || '',
      hr_headcount: m.hr_headcount || 0,
      hr_posts: m.hr_posts || '',
      hr_month_start: m.hr_month_start,
      hr_month_end: m.hr_month_end,
      fin_budget_impact: m.fin_budget_impact || 0,
      fin_subjects: m.fin_subjects || [],
      fin_description: m.fin_description || '',
      responsible_person: m.responsible_person || '',
      _version: m.version,
    })
    setEditing({ _id: m.id })
  }

  const handleSave = async () => {
    const data: Record<string, unknown> = {
      proj_id: form.proj_id || null,
      it_ids: form.it_ids || [],
      hr_change_desc: form.hr_change_desc || '',
      hr_headcount: form.hr_headcount || 0,
      hr_posts: form.hr_posts || '',
      hr_month_start: form.hr_month_start || null,
      hr_month_end: form.hr_month_end || null,
      fin_budget_impact: form.fin_budget_impact || 0,
      fin_subjects: form.fin_subjects || [],
      fin_description: form.fin_description || '',
      responsible_person: form.responsible_person || '',
    }

    try {
      if (editing?._new) {
        await api.createLinkageMapping(data)
      } else if (editing?._id) {
        ;(data as Record<string, unknown>).version = form._version as number
        await api.updateLinkageMapping(editing._id as number, data)
      }
      setEditing(null)
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('409') || msg.includes('已被他人修改')) {
        alert('数据已被他人修改，请刷新后重试')
        load()
        setEditing(null)
      } else {
        alert('保存失败: ' + msg)
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除此联动配置？')) return
    try {
      await api.deleteLinkageMapping(id)
      load()
    } catch (e: unknown) {
      alert('删除失败: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const handleSimulate = async () => {
    try {
      const r = await api.simulateImpact({ proj_id: simProjId, hr_change: simHrChange })
      setSimResult(r)
    } catch (e: unknown) {
      alert('模拟失败: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const handleHrHeadcountChange = (v: number) => {
    setF('hr_headcount', v)
    setF('fin_budget_impact', Math.round(v * PER_PERSON_COST * 100) / 100)
  }

  const toggleItId = (id: number) => {
    const ids = (form.it_ids as number[]) || []
    setF('it_ids', ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-gray-500)' }}>加载中...</div>
  }

  return (
    <div>
      <Section title="四维联动配置" badge="人力优化 → 财务工资预算">
        <div style={{ padding: 20 }}>
          <div className="alert-row">
            <div className="alert-item alert-blue">
              每人均摊成本 <strong>{PER_PERSON_COST}万元/年</strong>（8500元/月 × 12个月）。增减人员时，财务预算按此标准自动联动。
            </div>
          </div>
        </div>
      </Section>

      {summary && (
        <Section title="联动概览">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: 16 }}>
            <div className="stat-card">
              <div className="stat-num">{summary.total_mappings}</div>
              <div className="stat-label">联动配置数</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: summary.total_hr_impact >= 0 ? 'var(--pro)' : 'var(--hr)' }}>
                {summary.total_hr_impact > 0 ? '+' : ''}{summary.total_hr_impact}
              </div>
              <div className="stat-label">人力净变化(人)</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: summary.total_budget_impact >= 0 ? 'var(--hr)' : 'var(--pro)' }}>
                {summary.total_budget_impact > 0 ? '+' : ''}{summary.total_budget_impact.toFixed(1)}
              </div>
              <div className="stat-label">预算净影响(万元/年)</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{summary.pro_coverage.mapped}/{summary.pro_coverage.total}</div>
              <div className="stat-label">专业项目覆盖率</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 16px 16px' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 6 }}>人力维度</div>
              <div style={{ fontSize: 13 }}>
                增员 <span style={{ color: 'var(--hr)', fontWeight: 600 }}>+{summary.by_dimension.hr_impact.increase}人</span>
                {' · '}
                减员 <span style={{ color: 'var(--pro)', fontWeight: 600 }}>{summary.by_dimension.hr_impact.decrease}人</span>
                {' · '}
                净变化 <span style={{ fontWeight: 600 }}>{summary.by_dimension.hr_impact.net > 0 ? '+' : ''}{summary.by_dimension.hr_impact.net}人</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 6 }}>预算维度</div>
              <div style={{ fontSize: 13 }}>
                增加 <span style={{ color: 'var(--hr)', fontWeight: 600 }}>+{summary.by_dimension.budget_impact.increase.toFixed(1)}万</span>
                {' · '}
                减少 <span style={{ color: 'var(--pro)', fontWeight: 600 }}>{summary.by_dimension.budget_impact.decrease.toFixed(1)}万</span>
                {' · '}
                净变化 <span style={{ fontWeight: 600 }}>{summary.by_dimension.budget_impact.net > 0 ? '+' : ''}{summary.by_dimension.budget_impact.net.toFixed(1)}万</span>
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section
        title="影响模拟器"
        badge="快速测算人力变化对预算的影响"
      >
        <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 4 }}>关联项目</div>
            <select
              value={simProjId ?? ''}
              onChange={e => setSimProjId(e.target.value ? Number(e.target.value) : null)}
              style={{ padding: '6px 8px', border: '1px solid var(--color-gray-200)', borderRadius: 4, fontSize: 13, minWidth: 180 }}
            >
              <option value="">-- 不限项目 --</option>
              {projList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 4 }}>人力变化(人)</div>
            <input
              type="number"
              value={simHrChange}
              onChange={e => setSimHrChange(Number(e.target.value))}
              style={{ width: 100, padding: '6px 8px', border: '1px solid var(--color-gray-200)', borderRadius: 4, fontSize: 13 }}
              placeholder="+增/-减"
            />
          </div>
          <button className="btn btn-primary" onClick={handleSimulate}>测算</button>
        </div>
        {simResult && (
          <div style={{ margin: '0 16px 16px', padding: 12, background: 'var(--color-gray-50)', borderRadius: 8 }}>
            <div style={{ fontSize: 13 }}>
              项目 <strong>{simResult.proj_name}</strong>
              {' · '}
              人力变化 <strong style={{ color: simResult.hr_change >= 0 ? 'var(--hr)' : 'var(--pro)' }}>
                {simResult.hr_change > 0 ? '+' : ''}{simResult.hr_change}人
              </strong>
              {' → '}
              预算影响 <strong style={{ color: simResult.total_impact >= 0 ? 'var(--hr)' : 'var(--pro)' }}>
                {simResult.total_impact > 0 ? '+' : ''}{simResult.total_impact}万元/年
              </strong>
              <span style={{ color: 'var(--color-gray-500)', fontSize: 12, marginLeft: 12 }}>
                (单价 {simResult.per_person_cost}万/人·年)
              </span>
            </div>
          </div>
        )}
      </Section>

      <Section
        title="联动配置清单"
        actions={
          !editing && (
            <button className="btn" onClick={openCreate}><IconAdd size={14} />新增配置</button>
          )
        }
      >
        {editing && (
          <Section
            title={editing._new ? '新增联动配置' : '编辑联动配置'}
            actions={
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={handleSave}><IconSave size={14} />保存</button>
                <button className="btn btn-o" onClick={() => setEditing(null)}>取消</button>
              </div>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 16 }}>
              <div>
                <div className="form-label">关联专业项目</div>
                <select
                  value={(form.proj_id as number | null) ?? ''}
                  onChange={e => setF('proj_id', e.target.value ? Number(e.target.value) : null)}
                  className="form-select"
                >
                  <option value="">-- 不关联 --</option>
                  {projList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="form-label">人力变化描述</div>
                <input
                  value={(form.hr_change_desc as string) || ''}
                  onChange={e => setF('hr_change_desc', e.target.value)}
                  className="form-input"
                  placeholder="如：新增2名开发"
                />
              </div>
              <div>
                <div className="form-label">岗位名称</div>
                <input
                  value={(form.hr_posts as string) || ''}
                  onChange={e => setF('hr_posts', e.target.value)}
                  className="form-input"
                  placeholder="如：Java开发工程师"
                />
              </div>
              <div>
                <div className="form-label">
                  人数变化 <span style={{ color: 'var(--color-gray-400)' }}>(正=增, 负=减)</span>
                </div>
                <input
                  type="number"
                  value={(form.hr_headcount as number) || 0}
                  onChange={e => handleHrHeadcountChange(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              <div>
                <div className="form-label">预算影响(万元/年) <span style={{ color: 'var(--color-gray-400)' }}>自动计算</span></div>
                <input
                  type="number"
                  value={(form.fin_budget_impact as number) || 0}
                  onChange={e => setF('fin_budget_impact', Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--color-gray-200)', borderRadius: 4, fontSize: 13, background: 'var(--color-gray-50)' }}
                  readOnly
                />
              </div>
              <div>
                <div className="form-label">负责人</div>
                <input
                  value={(form.responsible_person as string) || ''}
                  onChange={e => setF('responsible_person', e.target.value)}
                  className="form-input"
                  placeholder="如：张三"
                />
              </div>
              <div>
                <div className="form-label">开始月份</div>
                <select
                  value={(form.hr_month_start as number | null) ?? ''}
                  onChange={e => setF('hr_month_start', e.target.value ? Number(e.target.value) : null)}
                  className="form-select"
                >
                  <option value="">-- 不限 --</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="form-label">结束月份</div>
                <select
                  value={(form.hr_month_end as number | null) ?? ''}
                  onChange={e => setF('hr_month_end', e.target.value ? Number(e.target.value) : null)}
                  className="form-select"
                >
                  <option value="">-- 不限 --</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div className="form-label">财务科目（逗号分隔）</div>
                <input
                  value={(form.fin_subjects as string[]).join(', ')}
                  onChange={e => setF('fin_subjects', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  className="form-input"
                  placeholder="如：工资预算, 社保公积金"
                />
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <div className="form-label">财务描述</div>
                <textarea
                  value={(form.fin_description as string) || ''}
                  onChange={e => setF('fin_description', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--color-gray-200)', borderRadius: 4, fontSize: 13, minHeight: 60, resize: 'vertical' }}
                  placeholder="描述此项人力变化对财务的具体影响..."
                />
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 6 }}>关联信息化项目</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {itList.map(it => {
                    const checked = ((form.it_ids as number[]) || []).includes(it.id)
                    return (
                      <label
                        key={it.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', border: '1px solid var(--color-gray-200)', borderRadius: 4,
                          fontSize: 12, cursor: 'pointer',
                          background: checked ? 'var(--blue-bg)' : 'white',
                          borderColor: checked ? 'var(--pro)' : 'var(--color-gray-200)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItId(it.id)}
                          style={{ margin: 0 }}
                        />
                        {it.main} - {it.sub}
                      </label>
                    )
                  })}
                  {itList.length === 0 && (
                    <span style={{ color: 'var(--color-gray-400)', fontSize: 12 }}>暂无信息化项目数据</span>
                  )}
                </div>
              </div>
            </div>
          </Section>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, gap: 8, padding: '0 16px' }}>
          <SearchBar value={search} placeholder="搜索关联项目 / 负责人 / 岗位..." onChange={setSearch} onSearch={handleSearch} onClear={handleClear} />
        </div>

        <div style={{ padding: 16 }}>
          <table>
            <thead>
              <tr>
                <th>关联项目</th>
                <th>信息化项目</th>
                <th className="t-c">人力变化</th>
                <th className="t-c">预算影响(万/年)</th>
                <th>财务科目</th>
                <th>负责人</th>
                <th className="t-c">操作</th>
              </tr>
            </thead>
            <tbody>
              {mappings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: 24 }}>
                    暂无联动配置，点击「+ 新增配置」开始建立联动关系
                  </td>
                </tr>
              ) : (
                mappings.map(m => (
                  <tr key={m.id}>
                    <td>{m.proj_name || <span style={{ color: 'var(--color-gray-400)' }}>未关联</span>}</td>
                    <td>
                      {m.it_names.length > 0
                        ? m.it_names.join(', ')
                        : <span style={{ color: 'var(--color-gray-400)' }}>未关联</span>}
                    </td>
                    <td className="t-c">
                      <span style={{ color: m.hr_headcount >= 0 ? 'var(--hr)' : 'var(--pro)', fontWeight: 600 }}>
                        {m.hr_headcount > 0 ? '+' : ''}{m.hr_headcount}人
                      </span>
                      {m.hr_change_desc && (
                        <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>{m.hr_change_desc}</div>
                      )}
                    </td>
                    <td className="t-c">
                      <span style={{ color: m.fin_budget_impact >= 0 ? 'var(--hr)' : 'var(--pro)', fontWeight: 600 }}>
                        {m.fin_budget_impact > 0 ? '+' : ''}{m.fin_budget_impact}
                      </span>
                    </td>
                    <td>
                      {m.fin_subjects.length > 0
                        ? m.fin_subjects.join(', ')
                        : <span style={{ color: 'var(--color-gray-400)' }}>-</span>}
                    </td>
                    <td>{m.responsible_person || <span style={{ color: 'var(--color-gray-400)' }}>-</span>}</td>
                    <td className="t-c">
                      <button className="btn btn-o" onClick={() => openEdit(m)} style={{ marginRight: 4 }}><IconEdit size={14} /></button>
                      <button className="btn btn-o" onClick={() => handleDelete(m.id)}><IconDelete size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination page={page} pageSize={pageSize} total={total} onChange={handlePageChange} />
        </div>
      </Section>
    </div>
  )
}
