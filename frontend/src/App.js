import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DataLedger from './pages/DataLedger';
import RiskAnalysis from './pages/RiskAnalysis';
import BreachMonitor from './pages/BreachMonitor';
import DeletionRequests from './pages/DeletionRequests';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import PolicySummary from './pages/PolicySummary';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-navy-900">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="data-ledger" element={<DataLedger />} />
        <Route path="risk-analysis" element={<RiskAnalysis />} />
        <Route path="breach-monitor" element={<BreachMonitor />} />
        <Route path="deletion-requests" element={<DeletionRequests />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="policy-summary" element={<PolicySummary />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{ fontFamily: '"Times New Roman", Times, serif' }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
