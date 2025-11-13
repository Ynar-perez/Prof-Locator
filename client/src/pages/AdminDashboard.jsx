import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, Admin {user.name}</h1>
      <button onClick={logout}>Logout</button>
      <p>Here you will manage all users.</p>
    </div>
  );
};
export default AdminDashboard;