import { useEffect, useState } from 'react'
import Section from '../components/Section'
import PhaseDots from '../components/PhaseDots'
import { api, type ProfessionalProject } from '../services/api'

const emptyForm = {
  department: '', name: '', goal: '', context: '', deliverable: '',
  person: '', start_date: '', end_date: '', duration: '', phase_count: 0,
}

export default function ProfessionalPage() {
  const [projects, setProjects] = useState<ProfessionalProject[]>([])
  const [detail, setDetail] = useState<ProfessionalProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({ ...emptyForm })

  const load = () => {
    api.getProfessionalProjects().then(setProjects).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ ...emptyForm })
    setEditing({ _new: true })
  }

  const openEdit = (p: ProfessionalProject) => {
    setForm({
      department: p.dept || '',
      name: p.name || '',
      goal: p.goal || '',
      context: p.context || '',
      deliverable: p.deliverable || '',
      person: p.person || '',
      start_date: p.start || '',
      end_date: p.end || '',
      duration: p.period || '',
      phase_count: p.phases || 0,
    })
    setEditing({ _id: p.id })
  }

  const handleSave = async () => {
    if (editing?._new) {
      await api.createProfessionalProject(form)
    } else if (editing?._id) {
      await api.updateProfessionalProject(editing._id as number, form)
    }
    setEditing(null)
    load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除此项目？阶段数据也将一并删除。')) {
      await api.deleteProfessionalProject(id)
      load()
    }
  }

  const setF = (k: string, v: string | number) => setForm({ ...form, [k]: v })

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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="btn" onClick={openCreate}>➕ 新增项目</button>
      </div>

      {editing && (
        <Section title={editing._new ? '新增项目' : '编辑项目'} actions={
          <div>
            <button className="btn" onClick={handleSave} style={{ marginRight: 8 }}>💾 保存</button>
            <button className="btn btn-o" onClick={() => setEditing(null)}>取消</button>
          </div>
        }>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 16 }}>
            {[
              ['name', '项目名称'],
              ['department', '所属部门'],
              ['person', '责任人'],
              ['goal', '核心目标'],
              ['context', '背景'],
              ['deliverable', '交付物'],
              ['start_date', '开始日期'],
              ['end_date', '结束日期'],
              ['duration', '周期'],
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
              <div style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 2 }}>阶段数量</div>
              <input
                type="number"
                value={form.phase_count as number || 0}
                onChange={e => setF('phase_count', parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--g200)', borderRadius: 4, fontSize: 13 }}
              />
            </div>
          </div>
        </Section>
      )}

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
              <th style={{ width: 80 }}>操作</th>
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
                  <td><PhaseDots pStat={pStat} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', marginRight: 4 }} onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--fin)' }} onClick={() => handleDelete(p.id)}>🗑️</button>
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
