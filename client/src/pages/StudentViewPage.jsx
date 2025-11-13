import React from 'react';
import { useAuth } from '../context/AuthContext';

const StudentViewPage = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
      <p>Here is the list of all instructors:</p>
      {/* Instructor list will be fetched and displayed here */}
    </div>
  );
};
export default StudentViewPage;