export interface ProfessionalProject {
  id: number
  name: string
  dept: string
  goal: string
  person: string
  period: string
  start: string
  end: string
  phases: number
  pStat: PhaseStatus[]
}

export type PhaseStatus = 'done' | 'doing' | 'todo' | 'plan' | 'paused'

export interface ITProject {
  id: number
  main: string
  sub: string
  goal: string
  period: string
  status: ITStatus
  issue: string
  solve: string
}

export type ITStatus = 'done' | 'doing' | 'plan'

export interface Employee {
  name: string
  post: string
  dept: string
  edu: string
  age: number
  service: number
  match: string
}

export interface DistributionItem {
  label: string
  count: number
  rate: string
}

export interface HRPlanItem {
  item: string
  target: string
  data: (string | number)[]
}

export interface HRChangeItem {
  name: string
  dept: string
  post: string
  m4: string
  m5: string
  m6: string
  m7: string
  m8: string
}

export interface FinanceStructureItem {
  cat: string
  item: string
  budget: number
  rate: string
  compare: string
  strategy: string
}

export interface FinanceTimelinePhase {
  phase: string
  date: string
  items: string[]
}

export interface FinanceReductionItem {
  subject: string
  prev: number
  curr: number
  change: string
  detail: string
  level: string
  plan: string
}

export type PageKey = 'dash' | 'pro' | 'it' | 'hr' | 'fin' | 'link'

export type HRTabKey = 'overview' | 'plan' | 'change'

export type FinTabKey = 'budget' | 'timeline' | 'reduction'
