import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';

const Login = ({ loggedOut }) => {
  const { login, loading, error } = useAuth();
  const [associateId, setAssociateId] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(associateId, password);
    setSuccess(ok);
    if (ok) {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-gradient)' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 24px 0 rgba(60,60,60,0.09)', padding: 36, minWidth: 360, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {loggedOut && (
          <div style={{
            background: '#e8f5e9',
            color: '#388e3c',
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 6,
            marginBottom: 14,
            padding: '10px 0',
            textAlign: 'center',
            border: '1.5px solid #388e3c',
            boxShadow: '0 2px 8px 0 rgba(60,60,60,0.06)'
          }}>
            Logged out successfully
          </div>
        )}
        <h2 style={{ textAlign: 'center', fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', fontWeight: 800, fontSize: 26, margin: 0 }}>Leave Apply/Tracker Login</h2>
        <input
          type="text"
          value={associateId}
          onChange={e => setAssociateId(e.target.value)}
          placeholder="Associate ID"
          style={{ fontSize: 17, borderRadius: 8, border: '1.5px solid #b39ddb', padding: '10px 18px', fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ fontSize: 17, borderRadius: 8, border: '1.5px solid #b39ddb', padding: '10px 18px', fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif' }}
        />
        <button
          type="submit"
          className="button-primary"
          disabled={loading || !associateId || !password}
          style={{
            marginTop: 10,
            opacity: loading || !associateId || !password ? 0.6 : 1,
            cursor: loading || !associateId || !password ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          Login
        </button>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: '28px 0 10px 0', minHeight: 56 }}>
            <div className="simple-loader" style={{ marginRight: 14 }}></div>
            <span style={{ fontWeight: 600, color: '#666', fontSize: 18, fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif' }}>
              Authenticating your account...
            </span>
          </div>
        )}
        {error && !loading && <div style={{ color: '#d32f2f', fontWeight: 600, textAlign: 'center' }}>{error}</div>}
        {success && !loading && <div style={{ color: '#388e3c', fontWeight: 600, textAlign: 'center' }}>Login successful! Redirecting...</div>}
      </form>
    </div>
  );
};

export default Login;

