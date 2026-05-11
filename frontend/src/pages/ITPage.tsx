import { useEffect, useState } from 'react'
import Section from '../components/Section'
import StatusTag from '../components/StatusTag'
import { api, type ITProject } from '../services/api'

function getStatus(p: ITProject): 'done' | 'doing' | 'plan' {
  if (p.solve?.includes('已完成')) return 'done'
  if (p.phaseList?.length && p.phaseList.length > 0) return 'doing'
  return 'plan'
}

export default function ITPage() {
  const [projects, setProjects] = useState<ITProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getITProjects().then(setProjects).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--g500)' }}>加载中...</div>

  const total = projects.length
  const done = projects.filter(p => getStatus(p) === 'done').length
  const doing = projects.filter(p => getStatus(p) === 'doing').length
  const plan = projects.filter(p => getStatus(p) === 'plan').length

  return (
    <div>
      <div className="stats-mini">
        <div className="sm" style={{ background: 'var(--it-bg)' }}>
          <div className="smv" style={{ color: 'var(--it)' }}>{total}</div>
          <div className="sml">子项目总数</div>
        </div>
        <div className="sm" style={{ background: '#DCFCE7' }}>
          <div className="smv" style={{ color: '#16A34A' }}>{done}</div>
          <div className="sml">已完成</div>
        </div>
        <div className="sm" style={{ background: 'var(--hr-bg)' }}>
          <div className="smv" style={{ color: 'var(--hr)' }}>{doing}</div>
          <div className="sml">推进中</div>
        </div>
        <div className="sm" style={{ background: 'var(--g100)' }}>
          <div className="smv" style={{ color: 'var(--g500)' }}>{plan}</div>
          <div className="sml">待启动</div>
        </div>
      </div>

      <Section title="💻 信息化细化方案 (来源: 后勤部-信息化.xlsx)" badge={`${total}项 · 1 sheet`}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>序号</th>
              <th>一级项目</th>
              <th>子项目</th>
              <th style={{ minWidth: 200 }}>核心目标</th>
              <th style={{ width: 90 }}>周期</th>
              <th style={{ width: 70 }}>状态</th>
              <th style={{ minWidth: 180 }}>实施难点</th>
              <th style={{ width: 180 }}>解决的问题</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.main}</td>
                <td>{p.sub}</td>
                <td title={p.goal}>{p.goal ? p.goal.substring(0, 25) + '...' : '-'}</td>
                <td>{p.period}</td>
                <td><StatusTag status={getStatus(p)} /></td>
                <td title={p.issue}>{p.issue ? p.issue.substring(0, 20) + '...' : '-'}</td>
                <td title={p.solve}>{p.solve ? p.solve.substring(0, 20) + '...' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}
