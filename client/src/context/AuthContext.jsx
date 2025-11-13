import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: null,
    name: null,
    role: null,
    isAuthenticated: false,
  });

  // On initial app load, check localStorage for a token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        } else {
          // Token is valid, set the user state
          setUser({
            token: token,
            name: decoded.user.name,
            role: decoded.user.role,
            isAuthenticated: true,
          });
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem('token');
      }
    }
  }, []); // Empty array means this runs only once on mount

  // Function to log the user in
  const login = (token) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token); // Decode the new token
      setUser({
        token: token,
        name: decoded.user.name,
        role: decoded.user.role,
        isAuthenticated: true,
      });
    } catch (err) {
        console.error("Login failed, invalid token:", err);
    }
  };

  // Function to log the user out
  const logout = () => {
    localStorage.removeItem('token');
    setUser({ token: null, name: null, role: null, isAuthenticated: false });
  };

  const contextValue = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};