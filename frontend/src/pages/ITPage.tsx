import { useEffect, useState } from 'react'
import Section from '../components/Section'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import { api, type ITProject } from '../services/api'
import { IconAdd, IconSave, IconEdit, IconDelete } from '../components/Icons'

function getStatus(p: ITProject): 'done' | 'doing' | 'plan' {
  if (p.solve?.includes('已完成')) return 'done'
  if (p.phaseList?.length && p.phaseList.length > 0) return 'doing'
  return 'plan'
}

const emptyForm = {
  category: '', name: '', goal: '', context: '', deliverable: '',
  owner: '', start_date: '', end_date: '', duration: '', difficulty: '', solve: '', phase_count: 0,
}

export default function ITPage() {
  const [projects, setProjects] = useState<ITProject[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({ ...emptyForm })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)

  const load = () => {
    api.getITProjects(page, pageSize, search).then(res => {
      setProjects(res.data)
      setTotal(res.total)
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

  const openEdit = (p: ITProject) => {
    setForm({
      category: p.main || '',
      name: p.sub || '',
      goal: p.goal || '',
      context: p.context || '',
      deliverable: p.deliverable || '',
      owner: p.person || '',
      start_date: p.start_date || '',
      end_date: p.end_date || '',
      duration: p.period || '',
      difficulty: p.issue || '',
      solve: p.solve || '',
      phase_count: p.phase_count || 0,
    })
    setEditing({ _id: p.id })
  }

  const handleSave = async () => {
    if (editing?._new) {
      await api.createITProject(form)
    } else if (editing?._id) {
      await api.updateITProject(editing._id as number, form)
    }
    setEditing(null)
    load()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除此信息化项目？阶段数据也将一并删除。')) {
      await api.deleteITProject(id)
      load()
    }
  }

  const setF = (k: string, v: string | number) => setForm({ ...form, [k]: v })

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-gray-500)' }}>加载中...</div>

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
        <div className="sm" style={{ background: 'var(--color-gray-100)' }}>
          <div className="smv" style={{ color: 'var(--color-gray-500)' }}>{plan}</div>
          <div className="sml">待启动</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, gap: 8 }}>
        <SearchBar value={search} placeholder="搜索项目 / 一级项目 / 责任人..." onChange={setSearch} onSearch={handleSearch} onClear={handleClear} />
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={openCreate}><IconAdd size={14} />新增项目</button>
      </div>

      {editing && (
        <Section title={editing._new ? '新增信息化项目' : '编辑信息化项目'} actions={
          <div>
            <button className="btn" onClick={handleSave} style={{ marginRight: 8 }}><IconSave size={14} />保存</button>
            <button className="btn btn-o" onClick={() => setEditing(null)}>取消</button>
          </div>
        }>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 16 }}>
            {[
              ['name', '子项目名称'],
              ['category', '一级项目'],
              ['owner', '责任人'],
              ['goal', '核心目标'],
              ['context', '背景'],
              ['deliverable', '交付物'],
              ['difficulty', '实施难点'],
              ['solve', '解决方案'],
              ['start_date', '开始日期'],
              ['end_date', '结束日期'],
              ['duration', '周期'],
            ].map(([k, label]) => (
              <div key={k}>
                <div className="form-label">{label}</div>
                <input
                  value={form[k] as string || ''}
                  onChange={e => setF(k, e.target.value)}
                  className="form-input"
                />
              </div>
            ))}
            <div>
              <div className="form-label">阶段数量</div>
              <input
                type="number"
                value={form.phase_count as number || 0}
                onChange={e => setF('phase_count', parseInt(e.target.value) || 0)}
                className="form-input"
              />
            </div>
          </div>
        </Section>
      )}

      <Section title="信息化细化方案 (来源: 后勤部-信息化.xlsx)" badge={`${total}项 · 1 sheet`}>
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
              <th style={{ width: 80 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.id}>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{p.main}</td>
                <td>{p.sub}</td>
                <td title={p.goal}>{p.goal ? p.goal.substring(0, 25) + '...' : '-'}</td>
                <td>{p.period}</td>
                <td><StatusTag status={getStatus(p)} /></td>
                <td title={p.issue}>{p.issue ? p.issue.substring(0, 20) + '...' : '-'}</td>
                <td title={p.solve}>{p.solve ? p.solve.substring(0, 20) + '...' : '-'}</td>
                <td>
                  <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', marginRight: 4 }} onClick={() => openEdit(p)}><IconEdit size={14} /></button>
                  <button className="btn btn-o" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--fin)' }} onClick={() => handleDelete(p.id)}><IconDelete size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={total} onChange={handlePageChange} />
      </Section>
    </div>
  )
}
