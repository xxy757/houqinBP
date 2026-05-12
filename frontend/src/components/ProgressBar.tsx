interface ProgressBarProps {
  percent: number
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
      <div className="pbar">
        <div className="pf" style={{ width: `${percent}%` }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--g500)', whiteSpace: 'nowrap' }}>{percent}%</span>
    </div>
  )
}
