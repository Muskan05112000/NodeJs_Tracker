import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep localStorage in sync with user state
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  // Real login function (calls backend)
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setError('Invalid Username or password');
        setLoading(false);
        return false;
      }
      const data = await res.json();
      // Store token in session storage (or handle via user object if included there)
      if (data.token) {
        sessionStorage.setItem('token', data.token);
      }

      const userObj = {
        associateId: data.associateId,
        role: data.role,
        username: data.username,
        token: data.token
      };

      setUser(userObj);
      setLoading(false);
      return true;
    } catch (err) {
      setError('Network error');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
