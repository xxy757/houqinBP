function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function sendAPI<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = getHeaders()
  if (body) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
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
  progress: number
  status: string
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
  progress: number
  status: string
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
  m1: string
  m2: string
  m3: string
  m4: string
  m5: string
  m6: string
  m7: string
  m8: string
  m9: string
  m10: string
  m11: string
  m12: string
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

export interface LinkMapping {
  id: number
  proj_id: number | null
  proj_name: string | null
  it_ids: number[]
  it_names: string[]
  hr_change_desc: string
  hr_headcount: number
  hr_posts: string
  hr_month_start: number | null
  hr_month_end: number | null
  fin_budget_impact: number
  fin_subjects: string[]
  fin_description: string
  responsible_person: string
  created_at: string
  updated_at: string
  version: number
}

export interface LinkageSummary {
  total_mappings: number
  total_hr_impact: number
  total_budget_impact: number
  by_dimension: {
    hr_impact: { increase: number; decrease: number; net: number }
    budget_impact: { increase: number; decrease: number; net: number }
  }
  affected_subjects: { subject: string; amount: number }[]
  pro_coverage: { total: number; mapped: number; unmapped: number }
  it_projects_linked: number
}

export interface ImpactSimulation {
  proj_id: number | null
  proj_name: string
  hr_change: number
  per_person_cost: number
  total_impact: number
}

export const api = {
  getDashboard: () => fetchAPI<DashboardData>('/dashboard'),

  getProfessionalProjects: () => fetchAPI<ProfessionalProject[]>('/professional-projects'),
  getProfessionalProjectDetail: (id: number) => fetchAPI<ProfessionalProject>(`/professional-projects/${id}`),
  createProfessionalProject: (data: Record<string, unknown>) => sendAPI<{ id: number; message: string }>('POST', '/professional-projects', data),
  updateProfessionalProject: (id: number, data: Record<string, unknown>) => sendAPI<{ message: string }>('PUT', `/professional-projects/${id}`, data),
  deleteProfessionalProject: (id: number) => sendAPI<{ message: string }>('DELETE', `/professional-projects/${id}`),

  getITProjects: () => fetchAPI<ITProject[]>('/it-projects'),
  createITProject: (data: Record<string, unknown>) => sendAPI<{ id: number; message: string }>('POST', '/it-projects', data),
  updateITProject: (id: number, data: Record<string, unknown>) => sendAPI<{ message: string }>('PUT', `/it-projects/${id}`, data),
  deleteITProject: (id: number) => sendAPI<{ message: string }>('DELETE', `/it-projects/${id}`),

  getEmployees: (page = 1, pageSize = 100) => fetchAPI<EmployeesResponse>(`/hr/employees?page=${page}&page_size=${pageSize}`),
  createEmployee: (data: Record<string, unknown>) => sendAPI<{ id: number; message: string }>('POST', '/hr/employees', data),
  updateEmployee: (id: number, data: Record<string, unknown>) => sendAPI<{ message: string }>('PUT', `/hr/employees/${id}`, data),
  deleteEmployee: (id: number) => sendAPI<{ message: string }>('DELETE', `/hr/employees/${id}`),

  getHRDistributions: () => fetchAPI<HRDistributions>('/hr/distributions'),
  getHRPlanKPI: () => fetchAPI<HRPlanItem[]>('/hr/plan-kpi'),
  getHRMonthlyChanges: () => fetchAPI<HRChangeItem[]>('/hr/monthly-changes'),
  updateMonthlyStatus: (employeeName: string, month: number, status: string) =>
    sendAPI<{ message: string }>('PUT', '/hr/monthly-status', { employee_name: employeeName, month, status }),

  getFinanceIndicators: () => fetchAPI<FinanceIndicator>('/finance/indicators'),

  getFinanceBudget: () => fetchAPI<FinanceBudgetItem[]>('/finance/budget'),
  createFinanceBudget: (data: Record<string, unknown>) => sendAPI<{ id: number; message: string }>('POST', '/finance/budget', data),
  updateFinanceBudget: (id: number, data: Record<string, unknown>) => sendAPI<{ message: string }>('PUT', `/finance/budget/${id}`, data),
  deleteFinanceBudget: (id: number) => sendAPI<{ message: string }>('DELETE', `/finance/budget/${id}`),

  getFinanceTimeline: () => fetchAPI<TimelinePhase[]>('/finance/timeline'),

  getFinanceReduction: () => fetchAPI<ReductionItem[]>('/finance/reduction'),
  createFinanceReduction: (data: Record<string, unknown>) =>
    sendAPI<{ id: number; message: string }>('POST', '/finance/reduction', data),
  updateFinanceReduction: (id: number, data: Record<string, unknown>) =>
    sendAPI<{ message: string }>('PUT', `/finance/reduction/${id}`, data),
  deleteFinanceReduction: (id: number) =>
    sendAPI<{ message: string }>('DELETE', `/finance/reduction/${id}`),

  getLinkageMappings: () => fetchAPI<LinkMapping[]>('/linkage/mappings'),
  getLinkageMapping: (id: number) => fetchAPI<LinkMapping>(`/linkage/mappings/${id}`),
  createLinkageMapping: (data: Record<string, unknown>) =>
    sendAPI<{ id: number; message: string }>('POST', '/linkage/mappings', data),
  updateLinkageMapping: (id: number, data: Record<string, unknown>) =>
    sendAPI<{ message: string }>('PUT', `/linkage/mappings/${id}`, data),
  deleteLinkageMapping: (id: number) =>
    sendAPI<{ message: string }>('DELETE', `/linkage/mappings/${id}`),
  getLinkageSummary: () => fetchAPI<LinkageSummary>('/linkage/summary'),
  simulateImpact: (data: Record<string, unknown>) =>
    sendAPI<ImpactSimulation>('POST', '/linkage/impact-simulate', data),
}

interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    display_name: string
    permissions: string[]
  }
}

export const authApi = {
  login: (username: string, password: string) =>
    sendAPI<LoginResponse>('POST', '/auth/login', { username, password }),
  changePassword: (oldPassword: string, newPassword: string) =>
    sendAPI<{ message: string }>('PUT', '/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
}

export interface UserItem {
  id: number
  username: string
  display_name: string
  is_active: number
  version: number
  created_at: string
  roles: { id: number; code: string; name: string }[]
}

export interface RoleItem {
  id: number
  code: string
  name: string
  description: string | null
  version: number
  permissions: { id: number; code: string; name: string }[]
}

export interface PermissionItem {
  id: number
  code: string
  name: string
  description: string | null
}

export const rbacApi = {
  getUsers: () => fetchAPI<UserItem[]>('/users'),
  createUser: (data: Record<string, unknown>) =>
    sendAPI<{ id: number; message: string }>('POST', '/users', data),
  updateUser: (id: number, data: Record<string, unknown>) =>
    sendAPI<{ message: string; version: number }>('PUT', `/users/${id}`, data),
  deleteUser: (id: number) =>
    sendAPI<{ message: string }>('DELETE', `/users/${id}`),

  getRoles: () => fetchAPI<RoleItem[]>('/roles'),
  createRole: (data: Record<string, unknown>) =>
    sendAPI<{ id: number; message: string }>('POST', '/roles', data),
  updateRole: (id: number, data: Record<string, unknown>) =>
    sendAPI<{ message: string; version: number }>('PUT', `/roles/${id}`, data),
  deleteRole: (id: number) =>
    sendAPI<{ message: string }>('DELETE', `/roles/${id}`),

  getPermissions: () => fetchAPI<PermissionItem[]>('/permissions'),
}
