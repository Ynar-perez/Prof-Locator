import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// 💡 Import 'Navigate' for redirection
import { Navigate } from 'react-router-dom'; 

const LoginPage = () => {
  const { login, user } = useAuth(); // 💡 Get the 'user' object from context
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/users/login', { email, password });
      const { token } = res.data;

      // 2. Call the context login function.
      // This will update the 'user' state in the context
      login(token); 

    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Login failed. Check your details.');
    }
  };

  // 💡 --- THIS IS THE CRITICAL FIX ---
  // This check runs on every render.
  if (user.isAuthenticated) {
    // If the user is authenticated (either from loading the page
    // or just logging in), redirect them.
    // We send them to '/', where 'RootRedirector' will 
    // send them to their correct dashboard.
    return <Navigate to="/" replace />;
  }
  // ------------------------------------


  // If not authenticated, show the login form
  return (
    <div className="login-container">
      <h2>PROFLOCATOR Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email (Login ID):</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            minLength="5"
            required
          />
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default LoginPage;