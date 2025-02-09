import React from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AgentProvider } from './contexts/AgentContext';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { ProtectedAgentRoute } from './components/Auth/ProtectedAgentRoute';
import { PrivateRouteAgent } from "@/components/Auth/PrivateRouteAgent";
import { AgentRedirectRoute } from "@/components/Auth/AgentRedirectRoute";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { RootLayout } from './components/Layout/RootLayout';
import { usePreventRefresh } from './hooks/usePreventRefresh';
import { Toaster } from 'react-hot-toast';

// Pages
import { Login } from './pages/Login';
import { LoginAgente } from './pages/LoginAgente';
import { Register } from './pages/Register';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Extensions } from './pages/Extensions';
import { ExtensionsManagement } from './pages/extensions/Management';
import { Calls } from './pages/Calls';
import { History } from './pages/History';
import { DID } from './pages/DID';
import { Recharge } from './pages/Recharge';
import { Subscriptions } from './pages/Subscriptions';
import { Settings } from './pages/Settings';
import Plans from './pages/Plans';
import { Queues } from './pages/Queues';
import { SipAuto } from './pages/SipAuto';
import { CadastrarMailing } from './pages/mailing/CadastrarMailing';
import { GerenciarMailing } from './pages/mailing/GerenciarMailing';

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
import { Finance } from './pages/admin/Finance';

// Reseller Pages
import { ResellerLayout } from './components/Reseller/ResellerLayout';
import { ResellerDashboard } from './pages/reseller/Dashboard';
import { ResellerCustomers } from './pages/reseller/Customers';
import { ResellerPlans } from './pages/reseller/Plans';

// Agent Pages
import { DashAgente } from './pages/DashAgente';
import { PerfilAgente } from './pages/PerfilAgente';
import { AgentCallHistory } from './pages/AgentCallHistory';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 5000,
            theme: {
              primary: '#4C51BF',
              secondary: '#A3BFFA',
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: '#E53E3E',
              secondary: '#FED7D7',
            },
          },
        }}
      />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AgentProvider>
              <RealtimeProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/login-agente" element={<LoginAgente />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Rotas do Agente */}
                  <Route
                    path="/perfil-agente"
                    element={
                      <PrivateRouteAgent>
                        <PerfilAgente />
                      </PrivateRouteAgent>
                    }
                  />
                  <Route
                    path="/dash-agente"
                    element={
                      <PrivateRouteAgent>
                        <DashAgente />
                      </PrivateRouteAgent>
                    }
                  />
                  <Route
                    path="/historico-agente"
                    element={
                      <PrivateRouteAgent>
                        <AgentCallHistory />
                      </PrivateRouteAgent>
                    }
                  />

                  <Route path="/" element={
                    <>
                      <AgentRedirectRoute />
                      <ProtectedRoute><MainLayout /></ProtectedRoute>
                    </>
                  }>
                    <Route index element={<Navigate to="/dash" replace />} />
                    <Route path="dash" element={<Dashboard />} />
                    <Route path="extensions" element={<Extensions />} />
                    <Route path="extensions/management" element={<ExtensionsManagement />} />
                    <Route path="queues" element={<Queues />} />
                    <Route path="calls" element={<Calls />} />
                    <Route path="history" element={<History />} />
                    <Route path="did" element={<DID />} />
                    <Route path="recharge" element={<Recharge />} />
                    <Route path="subscriptions" element={<Subscriptions />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="plans" element={<Plans />} />
                    <Route path="sip-auto" element={<SipAuto />} />
                    <Route path="mailing/cadastrar" element={<CadastrarMailing />} />
                    <Route path="mailing/gerenciar" element={<GerenciarMailing />} />
                  </Route>

                  <Route path="/admin" element={
                    <>
                      <AgentRedirectRoute />
                      <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>
                    </>
                  }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="instances" element={<AdminInstances />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="extensions" element={<AdminExtensions />} />
                    <Route path="calleridblock" element={<AdminCallerIDBlock />} />
                    <Route path="call-history" element={<CallHistory />} />
                    <Route path="active-calls" element={<AdminActiveCalls />} />
                    <Route path="finance" element={<Finance />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="plans" element={<AdminPlans />} />
                  </Route>

                  <Route path="/reseller" element={
                    <>
                      <AgentRedirectRoute />
                      <ProtectedRoute requireReseller><ResellerLayout /></ProtectedRoute>
                    </>
                  }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<ResellerDashboard />} />
                    <Route path="customers" element={<ResellerCustomers />} />
                    <Route path="plans" element={<ResellerPlans />} />
                    <Route path="*" element={<div>Em desenvolvimento</div>} />
                  </Route>

                  {/* Fallback route para páginas não encontradas */}
                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-900">404</h1>
                        <p className="mt-4 text-xl text-gray-600">Página não encontrada</p>
                        <button
                          onClick={() => window.location.href = '/'}
                          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Voltar ao início
                        </button>
                      </div>
                    </div>
                  } />
                </Routes>
              </RealtimeProvider>
            </AgentProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;