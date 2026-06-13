import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { useStore } from './store';
import type { Role } from './types';
import Layout from './components/Layout/Layout';
import CustomerMenu from './components/Customer/CustomerMenu';
import Login from './components/AdminPanel/Login';
import AdminDashboard from './components/AdminPanel/AdminDashboard';
import POSInterface from './components/AdminPanel/POSInterface';
import InventoryManagement from './components/AdminPanel/InventoryManagement';
import ExpensesManagement from './components/AdminPanel/ExpensesManagement';
import CustomerManagement from './components/Customer/CustomerManagement';
import Reports from './components/Analytics/Reports';
import QRGenerator from './components/AdminPanel/QrGenerator';
import StaffOrdering from './components/AdminPanel/StaffOrdering';
import { getToken, clearToken } from './lib/api';
import { getMe } from './api/auth';

export default function App() {
  const { user, setUser } = useStore();
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitialized(true);
      return;
    }
    getMe()
      .then(apiUser => {
        setUser({
          id: String(apiUser.id),
          name: apiUser.name,
          email: apiUser.email,
          role: (apiUser.roles[0] as Role) ?? 'cashier',
          phone: apiUser.phone ?? undefined,
        });
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setInitialized(true));
  }, [setUser]);

  if (!initialized) {
    return (
      <ThemeProvider defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          {/* Public Customer View */}
          <Route path="/menu" element={<Layout><CustomerMenu /></Layout>} />

          {/* Auth Routes */}
          {!user ? (
            <Route path="*" element={<Login />} />
          ) : (
            <>
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/pos" element={<Layout><POSInterface /></Layout>} />
              <Route path="/take-order" element={<Layout><StaffOrdering /></Layout>} />
              <Route path="/inventory" element={<Layout><InventoryManagement /></Layout>} />
              <Route path="/expenses" element={<Layout><ExpensesManagement /></Layout>} />
              <Route path="/customers" element={<Layout><CustomerManagement /></Layout>} />
              <Route path="/reports" element={<Layout><Reports /></Layout>} />
              <Route path="/self-order-qr" element={<Layout><QRGenerator /></Layout>} />
              <Route path="/" element={<Navigate to={user.role === 'server' || user.role === 'cashier' ? '/pos' : '/admin'} replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
