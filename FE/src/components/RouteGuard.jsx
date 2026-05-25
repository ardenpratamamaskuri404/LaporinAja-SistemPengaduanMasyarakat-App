import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Redirect authenticated users away from auth pages
export const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Require login
export const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Normalize role: "Super Admin" -> "SUPER_ADMIN"
  const userRole = user.role?.replace(/\s/g, '_').toUpperCase();
  const allowedRoles = roles?.map(r => r.replace(/\s/g, '_').toUpperCase());

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'SUPER_ADMIN') return <Navigate to="/superadmin/dashboard" replace />;
    if (userRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};
