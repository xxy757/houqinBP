import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  badge?: string
  children: ReactNode
  actions?: ReactNode
}

export default function Section({ title, badge, children, actions }: SectionProps) {
  return (
    <div className="section">
      <div className="sh">
        <h3>{title}</h3>
        {badge && <span className="badge">{badge}</span>}
        {actions}
      </div>
      <div className="sb">{children}</div>
    </div>
  )
}
