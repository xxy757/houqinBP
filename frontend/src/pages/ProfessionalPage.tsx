import { useEffect, useState } from 'react'
import Section from '../components/Section'
import PhaseDots from '../components/PhaseDots'
import { api, type ProfessionalProject } from '../services/api'

export default function ProfessionalPage() {
  const [projects, setProjects] = useState<ProfessionalProject[]>([])
  const [detail, setDetail] = useState<ProfessionalProject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProfessionalProjects().then(setProjects).finally(() => setLoading(false))
  }, [])

  const openDetail = async (p: ProfessionalProject) => {
    const d = await api.getProfessionalProjectDetail(p.id)
    setDetail(d)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--g500)' }}>加载中...</div>

  const total = projects.length
  const ongoing = projects.filter(p => p.phaseList?.length > 0).length
  const todo = projects.filter(p => !p.phaseList || p.phaseList.length === 0).length

  return (
    <div>
      <div className="stats-mini">
        <div className="sm" style={{ background: 'var(--pro-bg)' }}>
          <div className="smv" style={{ color: 'var(--pro)' }}>{total}</div>
          <div className="sml">项目总数</div>
        </div>
        <div className="sm" style={{ background: '#DCFCE7' }}>
          <div className="smv" style={{ color: '#16A34A' }}>0</div>
          <div className="sml">已验收</div>
        </div>
        <div className="sm" style={{ background: 'var(--hr-bg)' }}>
          <div className="smv" style={{ color: 'var(--hr)' }}>{ongoing}</div>
          <div className="sml">推进中</div>
        </div>
        <div className="sm" style={{ background: 'var(--g100)' }}>
          <div className="smv" style={{ color: 'var(--g500)' }}>{todo}</div>
          <div className="sml">待启动</div>
        </div>
      </div>

      <Section title="📋 专业项目清单 (来源: 后勤部-专业.xlsx)" badge={`${total}项 · 1 sheet`}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>序号</th>
              <th>子项目</th>
              <th>所属部门</th>
              <th style={{ minWidth: 200 }}>核心目标</th>
              <th style={{ width: 80 }}>责任人</th>
              <th style={{ width: 80 }}>周期</th>
              <th style={{ width: 80 }}>开始</th>
              <th style={{ width: 80 }}>结束</th>
              <th style={{ width: 100 }}>阶段</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const phases = p.phaseList || []
              const pStat = phases.map((_, idx) => {
                if (idx === 0) return 'done' as const
                if (idx === 1 && phases.length > 2) return 'doing' as const
                return 'plan' as const
              })
              return (
                <tr key={p.id} className="proj-row" onClick={() => openDetail(p)}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td><span className="dept-tag">{p.dept}</span></td>
                  <td title={p.goal}>{p.goal ? p.goal.substring(0, 20) + '...' : '-'}</td>
                  <td>{p.person}</td>
                  <td>{p.period}</td>
                  <td>{p.start}</td>
                  <td>{p.end}</td>
                  <td>
                    <PhaseDots pStat={pStat} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Section>

      {detail && (
        <Section
          title={detail.name}
          actions={
            <button className="btn btn-o" style={{ marginLeft: 'auto' }} onClick={() => setDetail(null)}>
              ✕ 关闭
            </button>
          }
        >
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div><strong>所属部门:</strong> {detail.dept}</div>
              <div><strong>责任人:</strong> {detail.person}</div>
              <div><strong>周期:</strong> {detail.period}</div>
              <div><strong>时间:</strong> {detail.start} - {detail.end}</div>
              <div><strong>阶段数:</strong> {detail.phaseList?.length || 0} / {detail.phases}</div>
            </div>
            <div style={{ marginTop: 16 }}><strong>核心目标:</strong><br />{detail.goal}</div>
            {detail.deliverable && (
              <div style={{ marginTop: 12 }}><strong>交付物:</strong><br />{detail.deliverable}</div>
            )}
            {detail.phaseList && detail.phaseList.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>阶段详情:</strong>
                {detail.phaseList.map((ph) => (
                  <div key={ph.phase_order} className="tl-phase">
                    <div className="tp-h">{ph.name}</div>
                    <div className="tp-actions">{ph.phase_content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}
