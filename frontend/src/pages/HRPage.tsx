import { useEffect, useState } from 'react'
import Section from '../components/Section'
import Tabs from '../components/Tabs'
import { api, type Employee, type HRDistributions, type HRPlanItem, type HRChangeItem } from '../services/api'

const hrTabs = [
  { key: 'overview', label: '团队现状' },
  { key: 'plan', label: '年度KPI规划' },
  { key: 'change', label: '人员调整轨迹' },
]

type HRTabKey = 'overview' | 'plan' | 'change'

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<HRTabKey>('overview')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [dist, setDist] = useState<HRDistributions | null>(null)
  const [planKPI, setPlanKPI] = useState<HRPlanItem[]>([])
  const [changes, setChanges] = useState<HRChangeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getEmployees(1, 200),
      api.getHRDistributions(),
      api.getHRPlanKPI(),
      api.getHRMonthlyChanges(),
    ]).then(([empRes, distRes, planRes, changeRes]) => {
      setEmployees(empRes.data)
      setDist(distRes)
      setPlanKPI(planRes)
      setChanges(changeRes)
    }).finally(() => setLoading(false))
  }, [])

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

          <Section title="📋 人员名册 (来源: 后勤部-人力.xlsx)" badge={`${employees.length}人`}>
            <table>
              <thead>
                <tr>
                  <th>姓名</th><th>职务</th><th>部门</th><th>学历</th>
                  <th className="t-c">年龄</th><th className="t-c">司龄(年)</th><th>专业匹配</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 50).map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td><td>{p.post}</td><td>{p.dept}</td><td>{p.edu}</td>
                    <td className="t-c">{p.age}</td><td className="t-c">{p.service}</td><td>{p.match || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <Section title="🔄 人员调整月度轨迹 (来源: 后勤部-人力.xlsx)" badge="人员调整计划">
            <table>
              <thead>
                <tr>
                  <th>姓名</th><th>部门</th><th>职务</th>
                  <th>4月</th><th>5月</th><th>6月</th><th>7月</th><th>8月</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td><td>{p.dept}</td><td>{p.post}</td>
                    <td>{p.m4}</td><td>{p.m5}</td><td>{p.m6}</td><td>{p.m7}</td><td>{p.m8}</td>
                  </tr>
                ))}
                {changes.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--g500)', padding: 20 }}>暂无人员调整记录</td></tr>
                )}
              </tbody>
            </table>
          </Section>
        </div>
      )}
    </div>
  )
}
