import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import MainLayout from './components/layout/MainLayout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Main pages
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Foundation pages
import Customers from './pages/foundation/Customers';
import CustomerDetail from './pages/customers/CustomerDetail';
import Plans from './pages/foundation/Plans';
import Materials from './pages/foundation/Materials';

// Operations pages
import Jobs from './pages/operations/Jobs';
import Takeoffs from './pages/operations/Takeoffs';

// Transaction pages
import PurchaseOrders from './pages/transactions/PurchaseOrders';
import Schedule from './pages/transactions/Schedule';

// Other pages
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import './App.css';
import './design-system.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Routes>
            {/* Auth routes - public, no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main app routes - with layout */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />

            {/* Foundation routes */}
            <Route
              path="/foundation/customers"
              element={
                <MainLayout>
                  <Customers />
                </MainLayout>
              }
            />
            <Route
              path="/foundation/customers/:id"
              element={
                <MainLayout>
                  <CustomerDetail />
                </MainLayout>
              }
            />
            <Route
              path="/foundation/plans"
              element={
                <MainLayout>
                  <Plans />
                </MainLayout>
              }
            />
            <Route
              path="/foundation/materials"
              element={
                <MainLayout>
                  <Materials />
                </MainLayout>
              }
            />

            {/* Operations routes */}
            <Route
              path="/operations/jobs"
              element={
                <MainLayout>
                  <Jobs />
                </MainLayout>
              }
            />
            <Route
              path="/operations/takeoffs"
              element={
                <MainLayout>
                  <Takeoffs />
                </MainLayout>
              }
            />

            {/* Transaction routes */}
            <Route
              path="/transactions/purchase-orders"
              element={
                <MainLayout>
                  <PurchaseOrders />
                </MainLayout>
              }
            />
            <Route
              path="/transactions/schedule"
              element={
                <MainLayout>
                  <Schedule />
                </MainLayout>
              }
            />

            {/* Other routes */}
            <Route
              path="/reports"
              element={
                <MainLayout>
                  <Reports />
                </MainLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <MainLayout>
                  <Settings />
                </MainLayout>
              }
            />
            <Route
              path="/settings/profile"
              element={
                <MainLayout>
                  <Settings />
                </MainLayout>
              }
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
