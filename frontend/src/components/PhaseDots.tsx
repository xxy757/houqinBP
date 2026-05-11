import type { ProfessionalProject } from '../types'

interface PhaseDotsProps {
  pStat: ProfessionalProject['pStat']
}

export default function PhaseDots({ pStat }: PhaseDotsProps) {
  return (
    <div className="phase-dots">
      {pStat.map((s, j) => (
        <span key={j} className={s}>
          {j + 1}
        </span>
      ))}
    </div>
  )
}
