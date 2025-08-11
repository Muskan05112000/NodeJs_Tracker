import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ApplyLeave from "./components/ApplyLeave";
import Users from "./components/Users";
import Analysis from "./components/Analysis";
import Dashboard from "./components/Dashboard";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";

const roleOptions = ['Employee', 'Manager', 'Lead'];

function AccessDeniedBanner({ show }) {
  if (!show) return null;
  return (
    <div style={{
      background: '#ffebee',
      color: '#d32f2f',
      padding: '12px 0',
      textAlign: 'center',
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: 0.5,
      borderBottom: '2px solid #f44336',
      zIndex: 2000,
      position: 'fixed',
      top: 72,
      left: 'var(--sidebar-width, 60px)',
      width: 'calc(100vw - var(--sidebar-width, 60px))',
      transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)'
    }}>
      Access Denied: You do not have permission to view this page.
    </div>
  );
}

function ProtectedRoute({ element, allowedRoles }) {
  const location = useLocation();
  const { user } = useAuth();
  const [denied, setDenied] = useState(false);
  if (!user || !allowedRoles.includes(user.role)) {
    setTimeout(() => setDenied(false), 3000);
    return <>
      <AccessDeniedBanner show={true} />
      <Navigate to="/" state={{ from: location }} replace />
    </>;
  }
  return element;
}

const AppRoutes = () => {
  const { user, logout } = useAuth();
  const [showLogoutMsg, setShowLogoutMsg] = React.useState(false);
  const handleLogout = () => {
    logout();
    setShowLogoutMsg(true);
    setTimeout(() => setShowLogoutMsg(false), 2500);
  };
  if (!user) return <Login loggedOut={showLogoutMsg} />;
  return (
    <>
      <Sidebar userRole={user.role} />
      <TopBar />
      <div style={{ position: 'fixed', top: 16, right: 32, zIndex: 3000 }}>
        <button onClick={handleLogout} style={{ fontSize: 15, borderRadius: 8, fontWeight: 700, background: '#ede7f6', color: '#6a479c', border: '1.5px solid #b39ddb', padding: '6px 18px', cursor: 'pointer' }}>Logout</button>
      </div>
      <div id="main-content" style={{ marginLeft: 'var(--sidebar-width, 60px)', marginTop: 72, fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', background: 'var(--primary-gradient)', minHeight: '100vh', transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        <Routes>
          <Route path="/" element={<ApplyLeave />} />
          <Route path="/users" element={<ProtectedRoute element={<Users />} allowedRoles={['Manager', 'Lead']} userRole={user.role} />} />
          <Route path="/analysis" element={<ProtectedRoute element={<Analysis />} allowedRoles={['Manager', 'Lead']} userRole={user.role} />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <AppProvider>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </AppProvider>
);


export default App;
