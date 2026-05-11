import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ProfessionalPage from './pages/ProfessionalPage'
import ITPage from './pages/ITPage'
import HRPage from './pages/HRPage'
import FinancePage from './pages/FinancePage'
import LinkConfigPage from './pages/LinkConfigPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dash" replace />} />
          <Route path="dash" element={<DashboardPage />} />
          <Route path="pro" element={<ProfessionalPage />} />
          <Route path="it" element={<ITPage />} />
          <Route path="hr" element={<HRPage />} />
          <Route path="fin" element={<FinancePage />} />
          <Route path="link" element={<LinkConfigPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
