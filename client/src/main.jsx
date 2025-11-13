// client/src/main.jsx (UPDATED)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; 

// Import pages
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import StudentViewPage from './pages/StudentViewPage.jsx';
import RootRedirector from './components/RootRedirector.jsx'; // We'll create this
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      // --- Public / Redirect Routes ---
      { 
        index: true, // This makes it the default child for '/'
        element: <RootRedirector /> // Redirects based on auth status
      },
      { 
        path: 'login',
        element: <LoginPage /> 
      },

      // --- ADMIN Protected Route ---
      {
        element: <RoleProtectedRoute allowedRole="ADMIN" />,
        children: [
          { path: 'admin', element: <AdminDashboard /> }
        ]
      },

      // --- INSTRUCTOR Protected Route ---
      {
        element: <RoleProtectedRoute allowedRole="INSTRUCTOR" />,
        children: [
          { path: 'instructor', element: <InstructorDashboard /> }
        ]
      },
      
      // --- STUDENT Protected Route ---
      {
        element: <RoleProtectedRoute allowedRole="STUDENT" />,
        children: [
          { path: 'student-view', element: <StudentViewPage /> }
        ]
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);