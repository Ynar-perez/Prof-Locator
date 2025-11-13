import React from 'react';
import { useAuth } from '../context/AuthContext';

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, Instructor {user.name}</h1>
      <button onClick={logout}>Logout</button>
      <p>Here you will update your status and schedule.</p>
    </div>
  );
};
export default InstructorDashboard;