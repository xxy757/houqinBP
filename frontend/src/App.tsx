import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfessionalPage from './pages/ProfessionalPage'
import ITPage from './pages/ITPage'
import HRPage from './pages/HRPage'
import FinancePage from './pages/FinancePage'
import LinkConfigPage from './pages/LinkConfigPage'
import UserManagementPage from './pages/UserManagementPage'
import AuditLogPage from './pages/AuditLogPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dash" replace />} />
          <Route path="dash" element={<DashboardPage />} />
          <Route path="pro" element={<ProfessionalPage />} />
          <Route path="it" element={<ITPage />} />
          <Route path="hr" element={<HRPage />} />
          <Route path="fin" element={<FinancePage />} />
          <Route path="link" element={<LinkConfigPage />} />
          <Route path="admin/users" element={<ProtectedRoute permission="users:read"><UserManagementPage /></ProtectedRoute>} />
          <Route path="admin/audit" element={<ProtectedRoute permission="audits:read"><AuditLogPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
