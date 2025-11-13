// client/src/components/RoleProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// This component takes the 'allowedRole' as a prop
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
    // User is logged in, but not authorized for this page
    // Send them to a generic dashboard or an 'Unauthorized' page
    // For now, we'll send them back to the login page (or '/')
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in AND role matches, show the child component (the dashboard)
  return <Outlet />;
};

export default RoleProtectedRoute;