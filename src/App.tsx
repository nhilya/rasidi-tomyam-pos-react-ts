import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { useStore } from './store';
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

export default function App() {
  const { user } = useStore();

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
              <Route path="/employees" element={<Layout><QRGenerator /></Layout>} />
              <Route path="/" element={<Navigate to={user.role === 'server' || user.role === 'cashier' ? '/pos' : '/admin'} replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
