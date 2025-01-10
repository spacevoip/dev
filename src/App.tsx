import React from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { RootLayout } from './components/Layout/RootLayout';
import { usePreventRefresh } from './hooks/usePreventRefresh';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Extensions } from './pages/Extensions';
import { Calls } from './pages/Calls';
import { History } from './pages/History';
import { DID } from './pages/DID';
import { Recharge } from './pages/Recharge';
import { Subscriptions } from './pages/Subscriptions';
import { Settings } from './pages/Settings';
import { Plans } from './pages/Plans';
import { Queues } from './pages/Queues';
import { SipAuto } from './pages/SipAuto';

// Admin Pages
import { AdminLayout } from './components/Admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminInstances } from './pages/admin/Instances';
import { AdminUsers } from './pages/admin/Users';
import { AdminSettings } from './pages/admin/Settings';
import { AdminPlans } from './pages/admin/Plans';
import { CallHistory } from './pages/admin/CallHistory';
import { AdminExtensions } from './pages/admin/Extensions';
import { AdminCallerIDBlock } from './pages/admin/CallerIDBlock';
import { AdminActiveCalls } from './pages/admin/ActiveCalls';

// Reseller Pages
import { ResellerLayout } from './components/Reseller/ResellerLayout';
import { ResellerDashboard } from './pages/reseller/Dashboard';
import { ResellerCustomers } from './pages/reseller/Customers';
import { ResellerPlans } from './pages/reseller/Plans';

function AppContent() {
  usePreventRefresh();

  return (
    <RootLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dash" replace />} />
          <Route path="dash" element={<Dashboard />} />
          <Route path="extensions" element={<Extensions />} />
          <Route path="queues" element={<Queues />} />
          <Route path="calls" element={<Calls />} />
          <Route path="history" element={<History />} />
          <Route path="did" element={<DID />} />
          <Route path="recharge" element={<Recharge />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="plans" element={<Plans />} />
          <Route path="sip-auto" element={<SipAuto />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="instances" element={<AdminInstances />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="extensions" element={<AdminExtensions />} />
          <Route path="calleridblock" element={<AdminCallerIDBlock />} />
          <Route path="call-history" element={<CallHistory />} />
          <Route path="active-calls" element={<AdminActiveCalls />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="plans" element={<AdminPlans />} />
        </Route>

        <Route path="/reseller" element={<ProtectedRoute requireReseller><ResellerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ResellerDashboard />} />
          <Route path="customers" element={<ResellerCustomers />} />
          <Route path="plans" element={<ResellerPlans />} />
          <Route path="extensions" element={<div>Em desenvolvimento</div>} />
          <Route path="call-history" element={<div>Em desenvolvimento</div>} />
          <Route path="support" element={<div>Em desenvolvimento</div>} />
          <Route path="billing" element={<div>Em desenvolvimento</div>} />
          <Route path="company" element={<div>Em desenvolvimento</div>} />
          <Route path="settings" element={<div>Em desenvolvimento</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </RootLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;