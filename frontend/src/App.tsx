import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DataLedger from './pages/DataLedger'
import CompanyDetails from './pages/CompanyDetails'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import RiskAnalysis from './pages/RiskAnalysis'
import BreachMonitor from './pages/BreachMonitor'
import DeletionRequests from './pages/DeletionRequests'
import NotificationsPage from './pages/NotificationsPage'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/data-ledger" element={<DataLedger />} />
        <Route path="/data-ledger/:companyId" element={<CompanyDetails />} />
        <Route path="/data-ledger/:companyId/policy" element={<PrivacyPolicyPage />} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/breach-monitor" element={<BreachMonitor />} />
        <Route path="/deletion-requests" element={<DeletionRequests />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
