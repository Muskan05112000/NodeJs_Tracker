import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, IconButton, Badge, Menu, Button, CircularProgress } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const NotificationPanel = () => {
    const { fetchPendingRevocations, approveRevocation, declineRevocation, clearNotifications } = useContext(AppContext);
    const { user } = useAuth();
    const [notifications, setNotifications] = useState({
        pending: [],
        history: [], // Approved
        rejected: [] // Rejected
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);

    // Is Manager/Lead?
    const isManager = user?.role === 'Manager' || user?.role === 'Lead';

    const loadNotifications = async () => {
        const data = await fetchPendingRevocations();
        if (Array.isArray(data)) {
            // Filter logic
            const pending = data.filter(l => l.revocationRequest?.isRequested && l.status === 'Active');

            // For managers, history is all approved/rejected. For employees, it's their own (backend handles filtering)
            // EXCLUDE DISMISSED
            const history = data.filter(l => l.status === 'Revoked' && !l.notificationDismissed);
            const rejected = data.filter(l => l.revocationRequest?.isRejected && !l.notificationDismissed);

            setNotifications({ pending, history, rejected });
        }
    };

    // Poll for notifications
    useEffect(() => {
        if (!user) return;
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [user, fetchPendingRevocations]);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleApprove = async (leaveId) => {
        setLoading(true);
        await approveRevocation(leaveId);
        await loadNotifications();
        setLoading(false);
    };

    const handleDecline = async (leaveId) => {
        if (window.confirm("Are you sure you want to decline this revocation request?")) {
            setLoading(true);
            await declineRevocation(leaveId, "Declined by Manager");
            await loadNotifications();
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        setLoading(true);
        await clearNotifications();
        await loadNotifications();
        setLoading(false);
    };

    // Badge Count Logic
    // Manager: Pending Requests
    // Employee: Recent History (Approved/Rejected) count (optional, or just 0 to show icon)
    // For now, let's show Total New Items for everyone to be helpful.
    // But since "history" is 6 months, showing 50 red badge count is annoying.
    // Let's stick to Pending for Managers.
    const badgeCount = isManager ? notifications.pending.length : 0;

    const hasContent = notifications.pending.length > 0 || notifications.history.length > 0 || notifications.rejected.length > 0;

    // Check if there is any history to clear
    const hasHistory = notifications.history.length > 0 || notifications.rejected.length > 0;

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={badgeCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 600,
                        width: 420,
                        borderRadius: 18,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        backdropFilter: 'blur(16px)',
                        background: 'rgba(255, 255, 255, 0.9)', // Slight opacity for glass effect
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                MenuListProps={{ sx: { p: 0 } }}
            >
                {/* Header */}
                <Box sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #6a479c 0%, #4e2a84 100%)', // Match TopBar gradient roughly
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <NotificationsIcon sx={{ fontSize: 22 }} />
                    <Typography variant="h6" fontSize={17} fontWeight="800" sx={{ letterSpacing: 0.5 }}>
                        Notifications
                    </Typography>
                    {badgeCount > 0 && (
                        <Box sx={{
                            ml: 'auto',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 10,
                            px: 1.5,
                            py: 0.2,
                            fontSize: 12,
                            fontWeight: 700
                        }}>
                            {badgeCount} New
                        </Box>
                    )}
                </Box>

                {/* Content */}
                <Box sx={{ p: 0, background: '#f8f9fa' }}>
                    {!hasContent ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 6,
                            px: 3,
                            gap: 2,
                            minHeight: 200
                        }}>
                            <Box sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: '#ede7f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#b39ddb'
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="700" color="#424242">
                                    No Notifications
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                    You don&apos;t have any recent updates.
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                            {/* PENDING REQUESTS (Managers Only) */}
                            {isManager && notifications.pending.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Typography variant="caption" fontWeight="800" color="textSecondary" sx={{ px: 1, mt: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Action Required
                                    </Typography>
                                    {notifications.pending.map((leave) => (
                                        <Box key={leave._id} sx={{
                                            p: 2,
                                            background: '#fff',
                                            borderRadius: 3,
                                            border: '1px solid #e0e0e0',
                                            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                                            '&:hover': { boxShadow: '0 4px 12px 0 rgba(124,77,255,0.12)' }
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="800" color="#333">{leave.employee}</Typography>
                                                <Box sx={{ fontSize: 10, fontWeight: 700, background: '#ffebee', color: '#c62828', px: 1, borderRadius: 4 }}>REVOCATION</Box>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: 13 }}>
                                                {leave.type} • {new Date(leave.date).toLocaleDateString()}
                                            </Typography>
                                            <Box sx={{ background: '#f5f5f5', p: 1, borderRadius: 1, fontSize: 12, fontStyle: 'italic', mb: 2 }}>
                                                &quot;{leave.revocationRequest?.reason || 'No reason'}&quot;
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="contained" fullWidth size="small"
                                                    onClick={() => handleApprove(leave._id)}
                                                    disabled={loading}
                                                    sx={{ borderRadius: 8, background: 'linear-gradient(90deg, #66bb6a 0%, #43a047 100%)', textTransform: 'none' }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="contained" fullWidth size="small"
                                                    onClick={() => handleDecline(leave._id)}
                                                    disabled={loading}
                                                    sx={{ borderRadius: 8, background: '#ef5350', '&:hover': { background: '#d32f2f' }, textTransform: 'none' }}
                                                >
                                                    Decline
                                                </Button>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* HISTORY (Approved & Rejected) - Visible to All relevant */}
                            {(notifications.history.length > 0 || notifications.rejected.length > 0) && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: notifications.pending.length > 0 ? 2 : 0 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" px={1} mt={1}>
                                        <Typography variant="caption" fontWeight="800" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                            Recent Updates
                                        </Typography>
                                        {/* CLEAR HISTORY BUTTON - MANAGERS ONLY */}
                                        {isManager && (
                                            <Button
                                                size="small"
                                                onClick={handleClearHistory}
                                                disabled={loading}
                                                sx={{ fontSize: 10, textTransform: 'none', color: '#7c4dff', fontWeight: 700, minWidth: 'auto', p: 0.5 }}
                                            >
                                                Clear History
                                            </Button>
                                        )}
                                    </Box>

                                    {/* Rejected List (Recent Rejections) - Render First */}
                                    {notifications.rejected.map((leave) => (
                                        <Box key={leave._id} sx={{ p: 2, background: '#fff5f5', borderRadius: 3, border: '1px solid #ffebee' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="subtitle2" fontWeight="700" color="#555">{leave.employee}</Typography>
                                                <Box sx={{ fontSize: 10, fontWeight: 700, background: '#ffebee', color: '#c62828', px: 1, borderRadius: 4 }}>REJECTED</Box>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: 12 }}>
                                                {leave.type} ({new Date(leave.date).toLocaleDateString()}) - Revocation Declined
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                                By {leave.revocationRequest?.rejectedBy}
                                            </Typography>
                                        </Box>
                                    ))}

                                    {/* Approved List */}
                                    {notifications.history.map((leave) => (
                                        <Box key={leave._id} sx={{ p: 2, background: '#fcfcfc', borderRadius: 3, border: '1px solid #f0f0f0' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="subtitle2" fontWeight="700" color="#555">{leave.employee}</Typography>
                                                <Box sx={{ fontSize: 10, fontWeight: 700, background: '#e8f5e9', color: '#2e7d32', px: 1, borderRadius: 4 }}>APPROVED</Box>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: 12 }}>
                                                {leave.type} ({new Date(leave.date).toLocaleDateString()}) - Revocation Approved
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                                By {leave.revokedBy}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Menu>
        </>
    );
};

export default NotificationPanel;
