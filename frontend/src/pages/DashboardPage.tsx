import { useEffect, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import Section from '../components/Section'
import StatusTag from '../components/StatusTag'
import { api, type DashboardData, type TopProject, type TopITProject, type DeptDistItem, type FinanceCatItem } from '../services/api'
import type { PhaseStatus, ITStatus } from '../types'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-gray-500)' }}>加载中...</div>
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--fin)' }}>数据加载失败</div>

  const { kpi, top_projects, top_it_projects, dept_distribution, finance_categories } = data

  return (
    <div>
      <div className="kpi-row">
        <div className="kpi-card c1">
          <div className="kl">专业项目总数</div>
          <div className="kv" style={{ color: 'var(--pro)' }}>{kpi.proj_count}</div>
          <div className="ks">{dept_distribution.length}个部门 · 时间跨度5月-10月</div>
        </div>
        <div className="kpi-card c2">
          <div className="kl">信息化子项目</div>
          <div className="kv" style={{ color: 'var(--it)' }}>{kpi.it_count}</div>
          <div className="ks">{kpi.it_done}项已完成 · {kpi.it_doing_planning}项推进/规划中</div>
        </div>
        <div className="kpi-card c3">
          <div className="kl">在编人数</div>
          <div className="kv" style={{ color: 'var(--hr)' }}>
            {kpi.emp_count}<span style={{ fontSize: 14, color: 'var(--color-gray-500)' }}>→{kpi.emp_target}</span>
          </div>
          <div className="ks">目标编制{kpi.emp_target}人</div>
        </div>
        <div className="kpi-card c4">
          <div className="kl">年度预算</div>
          <div className="kv" style={{ color: 'var(--fin)' }}>
            {kpi.total_budget.toLocaleString()}<span style={{ fontSize: 14, color: 'var(--color-gray-500)' }}>万</span>
          </div>
          <div className="ks">Q1实际{kpi.q1_actual}万</div>
        </div>
      </div>

      <div className="grid2">
        <Section title={`专业项目进度 (${kpi.proj_count}项)`}>
          <table>
            <thead>
              <tr>
                <th>序号</th><th>项目名称</th><th>部门</th><th>周期</th><th>进度</th><th>状态</th>
              </tr>
            </thead>
            <tbody>
              {top_projects.map((p: TopProject, i: number) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td><span className="dept-tag">{p.department}</span></td>
                  <td>{p.duration}</td>
                  <td><ProgressBar percent={p.progress} /></td>
                  <td><StatusTag status={p.status as PhaseStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title={`信息化项目状态 (${kpi.it_count}项)`}>
          <table>
            <thead>
              <tr>
                <th>序号</th><th>子项目</th><th>一级项目</th><th>周期</th><th>进度</th><th>状态</th>
              </tr>
            </thead>
            <tbody>
              {top_it_projects.map((p: TopITProject, i: number) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{p.sub}</td>
                  <td>{p.main}</td>
                  <td>{p.duration}</td>
                  <td><ProgressBar percent={p.progress} /></td>
                  <td><StatusTag status={p.status as PhaseStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      <div className="grid2">
        <Section title="部门项目分布">
          <table>
            <thead>
              <tr><th>部门</th><th className="t-c">项目数</th><th className="t-c">占比</th></tr>
            </thead>
            <tbody>
              {dept_distribution.map((d: DeptDistItem) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td className="t-c">{d.count}</td>
                  <td className="t-c">{d.rate_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="费用结构总览">
          <table>
            <thead>
              <tr><th>费用类别</th><th className="t-c">年度预算(万)</th><th className="t-c">占比</th></tr>
            </thead>
            <tbody>
              {finance_categories.map((f: FinanceCatItem) => (
                <tr key={f.cat}>
                  <td>{f.cat}</td>
                  <td className="t-c">{f.budget?.toLocaleString()}</td>
                  <td className="t-c">{f.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  )
}
