// client/src/components/RoleProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RoleProtectedRoute = ({ allowedRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  console.log(`PROTECTED ROUTE (Checking for: ${allowedRole}) - User has role: '${user.role}'`);

  // 1. Check if user is logged in
  if (!user.isAuthenticated) {
    // Redirect to login, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if the logged-in user's role matches the allowed role
  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in AND role matches, show the child component (the dashboard)
  return <Outlet />;
};

export default RoleProtectedRoute;