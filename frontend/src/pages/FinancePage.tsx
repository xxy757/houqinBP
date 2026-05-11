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

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinTabKey>('budget')
  const [budget, setBudget] = useState<FinanceBudgetItem[]>([])
  const [timeline, setTimeline] = useState<TimelinePhase[]>([])
  const [reduction, setReduction] = useState<ReductionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getFinanceBudget(),
      api.getFinanceTimeline(),
      api.getFinanceReduction(),
    ]).then(([b, t, r]) => {
      setBudget(b)
      setTimeline(t)
      setReduction(r)
    }).finally(() => setLoading(false))
  }, [])

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

          <Section title="🏗️ 费用结构分析">
            <table>
              <thead>
                <tr>
                  <th>费用类别</th>
                  <th className="t-c">年度预算(万)</th>
                  <th className="t-c">占比</th>
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
