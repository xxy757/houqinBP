async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export interface DashboardKPI {
  proj_count: number
  it_count: number
  it_done: number
  it_doing_planning: number
  emp_count: number
  emp_target: number
  total_budget: number
  q1_actual: number
}

export interface TopProject {
  id: number
  department: string
  name: string
  goal: string
  person: string
  start_date: string
  end_date: string
  duration: string
  phase_count: number
  phases: { name: string }[]
}

export interface TopITProject {
  id: number
  main: string
  sub: string
  goal: string
  person: string
  start_date: string
  end_date: string
  duration: string
  solve: string
  difficulty: string
}

export interface DeptDistItem {
  label: string
  count: number
  rate_pct: number
}

export interface FinanceCatItem {
  cat: string
  budget: number
  rate: string
}

export interface DashboardData {
  kpi: DashboardKPI
  top_projects: TopProject[]
  top_it_projects: TopITProject[]
  dept_distribution: DeptDistItem[]
  finance_categories: FinanceCatItem[]
}

export interface ProfessionalProject {
  id: number
  dept: string
  name: string
  goal: string
  context: string
  deliverable: string
  person: string
  start: string
  end: string
  period: string
  phases: number
  phaseList: { phase_order: number; name: string; phase_content: string }[]
}

export interface ITProject {
  id: number
  main: string
  sub: string
  goal: string
  context: string
  deliverable: string
  person: string
  start_date: string
  end_date: string
  period: string
  issue: string
  solve: string
  phase_count: number
  phaseList: { phase_order: number; name: string; phase_content: string }[]
}

export interface Employee {
  id: number
  name: string
  post: string
  dept: string
  edu: string
  age: number
  service: number
  match: string
  gender: string
}

export interface EmployeesResponse {
  data: Employee[]
  total: number
  page: number
  page_size: number
}

export interface DistItem {
  label: string
  count: number
  rate: string
}

export interface HRDistributions {
  summary: {
    total: number
    avg_age: number
    avg_service: number
    above_bachelor_pct: number
  }
  education: DistItem[]
  age: DistItem[]
  gender: DistItem[]
  post_distribution: DistItem[]
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

export interface FinanceIndicator {
  summary: {
    total_budget: number
    q1_actual: number
    execution_rate: string
    remaining: number
  }
  indicators: Record<string, unknown>[]
}

export interface FinanceBudgetItem {
  id: number
  cat: string
  department: string
  m1: string | null
  m2: string | null
  m3: string | null
  m4: string | null
  m5: string | null
  m6: string | null
  m7: string | null
  m8: string | null
  m9: string | null
  m10: string | null
  m11: string | null
  m12: string | null
  total: string | null
  budget: number | null
}

export interface TimelinePhase {
  phase: string
  date: string
  items: string[]
}

export interface ReductionItem {
  id: number
  section: string
  subject: string
  prev: number
  curr: number
  change: string
  detail: string
  category: string
  level: string
  plan: string
}

export const api = {
  getDashboard: () => fetchAPI<DashboardData>('/dashboard'),
  getProfessionalProjects: () => fetchAPI<ProfessionalProject[]>('/professional-projects'),
  getProfessionalProjectDetail: (id: number) => fetchAPI<ProfessionalProject>(`/professional-projects/${id}`),
  getITProjects: () => fetchAPI<ITProject[]>('/it-projects'),
  getEmployees: (page = 1, pageSize = 100) => fetchAPI<EmployeesResponse>(`/hr/employees?page=${page}&page_size=${pageSize}`),
  getHRDistributions: () => fetchAPI<HRDistributions>('/hr/distributions'),
  getHRPlanKPI: () => fetchAPI<HRPlanItem[]>('/hr/plan-kpi'),
  getHRMonthlyChanges: () => fetchAPI<HRChangeItem[]>('/hr/monthly-changes'),
  getFinanceIndicators: () => fetchAPI<FinanceIndicator>('/finance/indicators'),
  getFinanceBudget: () => fetchAPI<FinanceBudgetItem[]>('/finance/budget'),
  getFinanceTimeline: () => fetchAPI<TimelinePhase[]>('/finance/timeline'),
  getFinanceReduction: () => fetchAPI<ReductionItem[]>('/finance/reduction'),
}
