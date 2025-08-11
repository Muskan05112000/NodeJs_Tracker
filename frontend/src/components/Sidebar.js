import React, { useState } from "react";
import '../globalStyles.css';
import { NavLink } from "react-router-dom";
import { Box, List, ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const Sidebar = ({ userRole }) => {
  const [hovered, setHovered] = useState(false);
  const canAccessUsers = userRole === 'Manager' || userRole === 'Lead';
  const canAccessAnalysis = userRole === 'Manager' || userRole === 'Lead';
  return (
    <Box
      sx={{
        width: hovered ? 220 : 60,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bgcolor: 'linear-gradient(135deg, #6a479c99 0%, #4e2a8499 100%)',
        background: 'linear-gradient(135deg, #6a479c99 0%, #4e2a8499 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        backgroundBlendMode: 'overlay',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRight: 'none',
        boxShadow: 4,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 1202,
      }}
      onMouseEnter={() => {
        setHovered(true);
        document.body.style.setProperty('--sidebar-width', '220px');
      }}
      onMouseLeave={() => {
        setHovered(false);
        document.body.style.setProperty('--sidebar-width', '60px');
      }}
    >
    {/* Branding/Logo */}
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #7c4dff 0%, #b388ff 100%)',
        borderRadius: 2,
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 10px 0 #b388ff44'
      }}>
        <GroupIcon sx={{ color: '#fff', fontSize: 28 }} />
      </Box>
      {hovered && (
        <span
          style={{
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 0.5,
            color: '#fff',
            fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
            marginLeft: 12
          }}
        >
          Leave Tracker
        </span>
      )}
    </Box>
    <List sx={{ flex: 1 }}>
      <NavLink to="/" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#1976d2' : '#fff' })} end>
        <ListItemButton sx={{
          borderRadius: 3,
          mb: 1.5,
          px: 2.5,
          py: 1.5,
          background: ({ isActive }) => isActive ? '#e3f2fd' : 'transparent',
          color: ({ isActive }) => isActive ? '#1976d2' : '#fff',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.3,
          transition: 'background 0.2s, color 0.2s',
          '&:hover': {
            background: '#e3f2fd',
            color: '#1976d2',
            boxShadow: 2,
          }
        }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><CalendarMonthIcon fontSize="medium" /></ListItemIcon>
          {hovered && (
            <ListItemText
              primary={<span style={{ fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18 }}>Apply Leave</span>}
            />
          )}
        </ListItemButton>
      </NavLink>
      {userRole === 'Employee' && (
        <ListItemButton disabled sx={{
          borderRadius: 3,
          mb: 1.5,
          px: 2.5,
          py: 1.5,
          opacity: 0.5,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.3,
          color: '#fff',
          cursor: 'not-allowed',
          background: 'transparent',
        }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><GroupIcon fontSize="medium" /></ListItemIcon>
          {hovered && (
            <ListItemText
              primary={<span style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center' }}>Users <span style={{ marginLeft: 7, display: 'inline-flex', alignItems: 'center' }}>{React.createElement(require('@mui/icons-material/LockOutlined').default, { fontSize: 'small' })}</span></span>}
            />
          )}
        </ListItemButton>
      )}
      {userRole === 'Employee' && (
        <ListItemButton disabled sx={{
          borderRadius: 3,
          mb: 1.5,
          px: 2.5,
          py: 1.5,
          opacity: 0.5,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.3,
          color: '#fff',
          cursor: 'not-allowed',
          background: 'transparent',
        }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><AnalyticsIcon fontSize="medium" /></ListItemIcon>
          {hovered && (
            <ListItemText
              primary={<span style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center' }}>Analysis <span style={{ marginLeft: 7, display: 'inline-flex', alignItems: 'center' }}>{React.createElement(require('@mui/icons-material/LockOutlined').default, { fontSize: 'small' })}</span></span>}
            />
          )}
        </ListItemButton>
      )}
      {userRole !== 'Employee' && (
        <NavLink to="/users" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#1976d2' : '#fff' })}>
          <ListItemButton sx={{
            borderRadius: 3,
            mb: 1.5,
            px: 2.5,
            py: 1.5,
            background: ({ isActive }) => isActive ? '#e3f2fd' : 'transparent',
            color: ({ isActive }) => isActive ? '#1976d2' : '#fff',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 0.3,
            transition: 'background 0.2s, color 0.2s',
            '&:hover': {
              background: '#e3f2fd',
              color: '#1976d2',
              boxShadow: 2,
            }
          }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><GroupIcon fontSize="medium" /></ListItemIcon>
            {hovered && (
              <ListItemText
                primary={<span style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18 }}>Users</span>}
              />
            )}
          </ListItemButton>
        </NavLink>
      )}
      {userRole !== 'Employee' && (
        <NavLink to="/analysis" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#1976d2' : '#fff' })}>
          <ListItemButton sx={{
            borderRadius: 3,
            mb: 1.5,
            px: 2.5,
            py: 1.5,
            background: ({ isActive }) => isActive ? '#e3f2fd' : 'transparent',
            color: ({ isActive }) => isActive ? '#1976d2' : '#fff',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 0.3,
            transition: 'background 0.2s, color 0.2s',
            '&:hover': {
              background: '#e3f2fd',
              color: '#1976d2',
              boxShadow: 2,
            }
          }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><AnalyticsIcon fontSize="medium" /></ListItemIcon>
            {hovered && (
              <ListItemText
                primary={<span style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18 }}>Analysis</span>}
              />
            )}
          </ListItemButton>
        </NavLink>
      )}
    </List>
  </Box>
);

}

export default Sidebar;
