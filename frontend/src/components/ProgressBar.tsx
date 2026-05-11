interface ProgressBarProps {
  percent: number
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className="pbar">
      <div className="pf" style={{ width: `${percent}%` }} />
    </div>
  )
}
