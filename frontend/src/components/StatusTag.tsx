import type { PhaseStatus, ITStatus } from '../types'

interface StatusTagProps {
  status: PhaseStatus | ITStatus
}

export default function StatusTag({ status }: StatusTagProps) {
  const map: Record<string, { cls: string; text: string }> = {
    done: { cls: 'stag-done', text: '完成' },
    doing: { cls: 'stag-doing', text: '进行中' },
    paused: { cls: 'stag-paused', text: '中断' },
    todo: { cls: 'stag-todo', text: '未开始' },
    plan: { cls: 'stag-todo', text: '未开始' },
  }
  const { cls, text } = map[status] ?? { cls: 'stag-todo', text: '未知' }
  return <span className={`stag ${cls}`}>{text}</span>
}
