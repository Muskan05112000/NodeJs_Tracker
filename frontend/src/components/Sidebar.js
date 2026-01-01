import React, { useState } from "react";
import '../globalStyles.css';
import { NavLink } from "react-router-dom";
import { Box, List, ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LeaveWrapped from "./LeaveWrapped";

const Sidebar = ({ userRole }) => {
  const [hovered, setHovered] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);

  return (
    <Box
      className="sidebar-container"
      sx={{ width: hovered ? 220 : 60 }}
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
        <Box className="sidebar-logo-box">
          <GroupIcon sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
        {hovered && (
          <span className="sidebar-title">
            Leave Tracker
          </span>
        )}
      </Box>

      <List sx={{ flex: 1 }}>
        <NavLink to="/" style={{ textDecoration: 'none' }} end>
          {({ isActive }) => (
            <ListItemButton
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><CalendarMonthIcon fontSize="medium" /></ListItemIcon>
              {hovered && (
                <ListItemText primary={<span className="sidebar-nav-text">Apply Leave</span>} />
              )}
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/leaderboard" style={{ textDecoration: 'none' }} end>
          {({ isActive }) => (
            <ListItemButton
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><EmojiEventsIcon fontSize="medium" /></ListItemIcon>
              {hovered && (
                <ListItemText primary={<span className="sidebar-nav-text">Leaderboard</span>} />
              )}
            </ListItemButton>
          )}
        </NavLink>

        {userRole === 'Employee' ? (
          <>
            <ListItemButton disabled className="sidebar-nav-item disabled">
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><GroupIcon fontSize="medium" /></ListItemIcon>
              {hovered && (
                <ListItemText primary={
                  <span className="sidebar-nav-text" style={{ display: 'flex', alignItems: 'center' }}>
                    Users <LockOutlinedIcon fontSize="small" sx={{ ml: 1 }} />
                  </span>
                } />
              )}
            </ListItemButton>
            <ListItemButton disabled className="sidebar-nav-item disabled">
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><AnalyticsIcon fontSize="medium" /></ListItemIcon>
              {hovered && (
                <ListItemText primary={
                  <span className="sidebar-nav-text" style={{ display: 'flex', alignItems: 'center' }}>
                    Analysis <LockOutlinedIcon fontSize="small" sx={{ ml: 1 }} />
                  </span>
                } />
              )}
            </ListItemButton>
          </>
        ) : (
          <>
            <NavLink to="/users" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <ListItemButton className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><GroupIcon fontSize="medium" /></ListItemIcon>
                  {hovered && (
                    <ListItemText primary={<span className="sidebar-nav-text">Users</span>} />
                  )}
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/analysis" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <ListItemButton className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><AnalyticsIcon fontSize="medium" /></ListItemIcon>
                  {hovered && (
                    <ListItemText primary={<span className="sidebar-nav-text">Analysis</span>} />
                  )}
                </ListItemButton>
              )}
            </NavLink>
          </>
        )}

        {userRole === 'Lead' ? (
          <NavLink to="/holiday-update" style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <ListItemButton className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><CalendarMonthIcon fontSize="medium" /></ListItemIcon>
                {hovered && (
                  <ListItemText primary={<span className="sidebar-nav-text">Holiday Update</span>} />
                )}
              </ListItemButton>
            )}
          </NavLink>
        ) : (
          <ListItemButton disabled className="sidebar-nav-item disabled">
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><LockOutlinedIcon fontSize="medium" /></ListItemIcon>
            {hovered && (
              <ListItemText primary={<span className="sidebar-nav-text">Holiday Update</span>} />
            )}
          </ListItemButton>
        )}

        <ListItemButton
          onClick={() => setWrappedOpen(true)}
          className="sidebar-nav-item"
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <span style={{ fontSize: 20 }}>🎁</span>
          </ListItemIcon>
          {hovered && (
            <ListItemText primary={<span className="sidebar-nav-text">My Wrapped</span>} />
          )}
        </ListItemButton>
      </List>
      <LeaveWrapped open={wrappedOpen} onClose={() => setWrappedOpen(false)} />
    </Box>
  );
}

export default Sidebar;
