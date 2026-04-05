import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Records   from './pages/Records';
import Users     from './pages/Users';

function PrivateRoute({ children, adminOnly }) {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !can.manageUsers) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/records" element={<PrivateRoute><Records /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute adminOnly><Users /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
