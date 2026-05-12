import { useEffect, useState } from 'react'
import Section from '../components/Section'
import Tabs from '../components/Tabs'
import { api, type FinanceBudgetItem, type TimelinePhase, type ReductionItem } from '../services/api'

const finTabs = [
  { key: 'budget', label: '26-27年预算' },
  { key: 'timeline', label: '执行时间线' },
  { key: 'reduction', label: '降费方案明细' },
]

type FinTabKey = 'budget' | 'timeline' | 'reduction'

const emptyBudget = {
  category: '', department: '',
  m1: '', m2: '', m3: '', m4: '', m5: '', m6: '',
  m7: '', m8: '', m9: '', m10: '', m11: '', m12: '',
  total: '', budget_num: '',
}

const emptyReduction = {
  section: '', cost_subject: '', year_2025_actual: undefined as number | undefined,
  year_budget: undefined as number | undefined, change_rate: '', detail_item: '',
  category: '', priority: '', reduction_plan: '',
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinTabKey>('budget')
  const [budget, setBudget] = useState<FinanceBudgetItem[]>([])
  const [timeline, setTimeline] = useState<TimelinePhase[]>([])
  const [reduction, setReduction] = useState<ReductionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBudget, setEditingBudget] = useState<Record<string, unknown> | null>(null)
  const [budgetForm, setBudgetForm] = useState<Record<string, unknown>>({ ...emptyBudget })
  const [editingReduction, setEditingReduction] = useState<Record<string, unknown> | null>(null)
  const [reductionForm, setReductionForm] = useState<Record<string, unknown>>({ ...emptyReduction })

  const load = () => {
    Promise.all([
      api.getFinanceBudget(),
      api.getFinanceTimeline(),
      api.getFinanceReduction(),
    ]).then(([b, t, r]) => {
      setBudget(b)
      setTimeline(t)
      setReduction(r)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreateBudget = () => {
    setBudgetForm({ ...emptyBudget })
    setEditingBudget({ _new: true })
  }

  const openEditBudget = (b: FinanceBudgetItem) => {
    setBudgetForm({
      category: b.cat || '',
      department: b.department || '',
      m1: b.m1 || '', m2: b.m2 || '', m3: b.m3 || '', m4: b.m4 || '', m5: b.m5 || '', m6: b.m6 || '',
      m7: b.m7 || '', m8: b.m8 || '', m9: b.m9 || '', m10: b.m10 || '', m11: b.m11 || '', m12: b.m12 || '',
      total: b.total || '',
      budget_num: b.budget ? String(b.budget) : '',
    })
    setEditingBudget({ _id: b.id })
  }

  const handleSaveBudget = async () => {
    if (editingBudget?._new) {
      await api.createFinanceBudget(budgetForm)
    } else if (editingBudget?._id) {
      await api.updateFinanceBudget(editingBudget._id as number, budgetForm)
    }
    setEditingBudget(null)
    load()
  }

  const handleDeleteBudget = async (id: number) => {
    if (confirm('确认删除此预算项？')) {
      await api.deleteFinanceBudget(id)
      load()
    }
  }

  const openCreateReduction = () => {
    setReductionForm({ ...emptyReduction })
    setEditingReduction({ _new: true })
  }

  const openEditReduction = (r: ReductionItem) => {
    setReductionForm({
      section: r.section || '',
      cost_subject: r.subject || '',
      year_2025_actual: r.prev,
      year_budget: r.curr,
      change_rate: r.change || '',
      detail_item: r.detail || '',
      category: r.category || '',
      priority: r.level || '',
      reduction_plan: r.plan || '',
    })
    setEditingReduction({ _id: r.id })
  }

  const handleSaveReduction = async () => {
    if (editingReduction?._new) {
      await api.createFinanceReduction(reductionForm)
    } else if (editingReduction?._id) {
      await api.updateFinanceReduction(editingReduction._id as number, reductionForm)
    }
    setEditingReduction(null)
    load()
  }

  const handleDeleteReduction = async (id: number) => {
    if (confirm('确认删除此降费项？')) {
      await api.deleteFinanceReduction(id)
      load()
    }
  }

  const setBF = (k: string, v: unknown) => setBudgetForm({ ...budgetForm, [k]: v })
  const setRF = (k: string, v: unknown) => setReductionForm({ ...reductionForm, [k]: v })

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--g500)' }}>加载中...</div>

  const totalBudget = budget.reduce((sum, b) => sum + (b.budget || 0), 0)
  const totalBudgetWan = Math.round(totalBudget / 10000)

  return (
    <div>
      <Tabs tabs={finTabs} active={activeTab} onChange={(k) => setActiveTab(k as FinTabKey)} />

      {activeTab === 'budget' && (
        <div className="page-enter">
          <div className="stats-mini" style={{ marginTop: 16 }}>
            <div className="sm" style={{ background: 'var(--fin-bg)' }}>
              <div className="smv" style={{ color: 'var(--fin)' }}>
                {totalBudgetWan.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>万</span>
              </div>
              <div className="sml">全年预算总额</div>
            </div>
            <div className="sm" style={{ background: 'var(--hr-bg)' }}>
              <div className="smv" style={{ color: 'var(--hr)' }}>
                540<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>万</span>
              </div>
              <div className="sml">Q1实际支出</div>
            </div>
            <div className="sm" style={{ background: 'var(--it-bg)' }}>
              <div className="smv" style={{ color: 'var(--it)' }}>
                {totalBudget > 0 ? Math.round(540 / totalBudgetWan * 100 * 100) / 100 : 0}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>%</span>
              </div>
              <div className="sml">预算已执行</div>
            </div>
            <div className="sm" style={{ background: 'var(--pro-bg)' }}>
              <div className="smv" style={{ color: 'var(--pro)' }}>
                {totalBudgetWan - 540}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--g500)' }}>万</span>
              </div>
              <div className="sml">剩余可用</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn" onClick={openCreateBudget}>➕ 新增预算项</button>
          </div>

          {editingBudget && (
            <Section title={editingBudget._new ? '新增预算项' : '编辑预算项'} actions={
              <div>
                <button className="btn" onClick={handleSaveBudget} style={{ marginRight: 8 }}>💾 保存</button>
                <button className="btn btn-o" onClick={() => setEditingBudget(null)}>取消</button>
              </div>
            }>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, padding: 16 }}>
                {[
                  ['category', '费用类别'],
                  ['department', '部门'],
                  ...Array.from({ length: 12 }, (_, i) => [`m${i + 1}`, `${i + 1}月`]),
                  ['total', '合计'],
                  ['budget_num', '预算金额'],
                ].map(([k, label]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}>{label}</div>
                    <input
                      value={budgetForm[k as string] as string || ''}
                      onChange={e => setBF(k, e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--g200)', borderRadius: 4, fontSize: 13 }}
                    />
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="🏗️ 费用结构分析">
            <table>
              <thead>
                <tr>
                  <th>费用类别</th>
                  <th className="t-c">年度预算(万)</th>
                  <th className="t-c">占比</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {budget.map((f) => {
                  const bw = (f.budget || 0) / 10000
                  return (
                    <tr key={f.id}>
                      <td>{f.cat}</td>
                      <td className="t-c">{bw.toLocaleString()}</td>
                      <td className="t-c">{totalBudget > 0 ? Math.round((f.budget || 0) / totalBudget * 100) + '%' : '0%'}</td>
                      <td>
                        <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', marginRight: 4 }} onClick={() => openEditBudget(f)}>✏️</button>
                        <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--fin)' }} onClick={() => handleDeleteBudget(f.id)}>🗑️</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Section>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="page-enter">
          <Section title="📅 执行时间线 2026年5月 - 2027年3月" badge={`${timeline.length}阶段`}>
            <div className="tl-block">
              {timeline.map((t) => (
                <div key={t.phase} className="tl-phase">
                  <div className="tp-h">
                    {t.phase}
                    {t.date && <span className="tp-date">{t.date}</span>}
                  </div>
                  <div className="tp-actions">
                    {t.items.map((item, idx) => (
                      <div key={idx}>{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'reduction' && (
        <div className="page-enter">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn" onClick={openCreateReduction}>➕ 新增降费项</button>
          </div>

          {editingReduction && (
            <Section title={editingReduction._new ? '新增降费项' : '编辑降费项'} actions={
              <div>
                <button className="btn" onClick={handleSaveReduction} style={{ marginRight: 8 }}>💾 保存</button>
                <button className="btn btn-o" onClick={() => setEditingReduction(null)}>取消</button>
              </div>
            }>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 16 }}>
                {[
                  ['cost_subject', '费用科目'],
                  ['section', '板块'],
                  ['category', '类别'],
                  ['detail_item', '详细项目'],
                  ['change_rate', '升降幅'],
                  ['priority', '优先级'],
                  ['reduction_plan', '降费方案摘要'],
                ].map(([k, label]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}>{label}</div>
                    <input
                      value={reductionForm[k as string] as string || ''}
                      onChange={e => setRF(k, e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--g200)', borderRadius: 4, fontSize: 13 }}
                    />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}>2025实际(万)</div>
                  <input
                    type="number"
                    value={reductionForm.year_2025_actual as number || ''}
                    onChange={e => setRF('year_2025_actual', parseFloat(e.target.value) || undefined)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--g200)', borderRadius: 4, fontSize: 13 }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}>本年预算(万)</div>
                  <input
                    type="number"
                    value={reductionForm.year_budget as number || ''}
                    onChange={e => setRF('year_budget', parseFloat(e.target.value) || undefined)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--g200)', borderRadius: 4, fontSize: 13 }}
                  />
                </div>
              </div>
            </Section>
          )}

          <Section title="📉 降费方案明细" badge={`${reduction.length}项`}>
            <table>
              <thead>
                <tr>
                  <th>费用科目</th>
                  <th className="t-c">2025实际(万)</th>
                  <th className="t-c">本年预算(万)</th>
                  <th className="t-c">升降幅</th>
                  <th>详细项目</th>
                  <th className="t-c">优先级</th>
                  <th style={{ minWidth: 220 }}>降费方案摘要</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {reduction.map((f) => (
                  <tr key={f.id}>
                    <td>{f.subject}</td>
                    <td className="t-c">{f.prev}</td>
                    <td className="t-c">{f.curr}</td>
                    <td className="t-c">{f.change}</td>
                    <td>{f.detail}</td>
                    <td className="t-c">{f.level}</td>
                    <td>{f.plan}</td>
                    <td>
                      <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', marginRight: 4 }} onClick={() => openEditReduction(f)}>✏️</button>
                      <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--fin)' }} onClick={() => handleDeleteReduction(f.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      )}
    </div>
  )
}
