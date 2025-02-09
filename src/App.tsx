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
                  {/* Rota raiz - Redireciona para dash-agente se estiver logado como agente */}
                  <Route 
                    path="/" 
                    element={
                      <AgentRedirectRoute>
                        <Navigate to="/dash-agente" replace />
                      </AgentRedirectRoute>
                    } 
                  />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/login-agente" element={<LoginAgente />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Rotas do Agente */}
                  <Route
                    path="/dash-agente"
                    element={
                      <PrivateRouteAgent>
                        <DashAgente />
                      </PrivateRouteAgent>
                    }
                  />
                  <Route
                    path="/perfil-agente"
                    element={
                      <PrivateRouteAgent>
                        <PerfilAgente />
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

                  {/* Rotas protegidas */}
                  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/extensions" element={<Extensions />} />
                    <Route path="/extensions/management" element={<ExtensionsManagement />} />
                    <Route path="/calls" element={<Calls />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/did" element={<DID />} />
                    <Route path="/recharge" element={<Recharge />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/queues" element={<Queues />} />
                    <Route path="/sipauto" element={<SipAuto />} />
                    <Route path="/mailing/cadastrar" element={<CadastrarMailing />} />
                    <Route path="/mailing/gerenciar" element={<GerenciarMailing />} />
                  </Route>

                  {/* Rotas do Admin */}
                  <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/instances" element={<AdminInstances />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/plans" element={<AdminPlans />} />
                    <Route path="/admin/call-history" element={<CallHistory />} />
                    <Route path="/admin/extensions" element={<AdminExtensions />} />
                    <Route path="/admin/callerid-block" element={<AdminCallerIDBlock />} />
                    <Route path="/admin/active-calls" element={<AdminActiveCalls />} />
                    <Route path="/admin/finance" element={<Finance />} />
                  </Route>

                  {/* Rotas do Reseller */}
                  <Route element={<ProtectedRoute><ResellerLayout /></ProtectedRoute>}>
                    <Route path="/reseller/dashboard" element={<ResellerDashboard />} />
                    <Route path="/reseller/customers" element={<ResellerCustomers />} />
                    <Route path="/reseller/plans" element={<ResellerPlans />} />
                  </Route>
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