import type { PhaseStatus, ITStatus } from '../types'

interface StatusTagProps {
  status: PhaseStatus | ITStatus
}

export default function StatusTag({ status }: StatusTagProps) {
  const map: Record<string, { cls: string; text: string }> = {
    done: { cls: 'stag-done', text: '已完成' },
    doing: { cls: 'stag-doing', text: '进行中' },
    todo: { cls: 'stag-plan', text: '待启动' },
    plan: { cls: 'stag-plan', text: '待启动' },
  }
  const { cls, text } = map[status] ?? { cls: 'stag-plan', text: '未知' }
  return <span className={`stag ${cls}`}>{text}</span>
}
