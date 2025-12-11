import React, { useMemo } from 'react';
import { Box, Typography, Avatar, Stack } from '@mui/material';
import { format } from 'date-fns';

const MonthLeaderboard = ({ leaves, currentMonth, employees }) => {
    // Calculate leaderboard data
    const { leaderboard, maxCount } = useMemo(() => {
        const monthStr = format(currentMonth, 'yyyy-MM');

        // 1. Filter leaves for this month
        const monthLeaves = leaves.filter(l => l.date.startsWith(monthStr) && l.status !== 'Revoked');

        const counts = {};
        employees.forEach(emp => { counts[emp.name] = 0; });

        monthLeaves.forEach(l => {
            counts[l.employee] = (counts[l.employee] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const max = sorted.length > 0 ? sorted[0].count : 0;
        return { leaderboard: sorted, maxCount: max };
    }, [leaves, currentMonth, employees]);

    if (leaderboard.length === 0) return null;

    // Helper for Avatar Color
    const stringToColor = (string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    return (
        <Box sx={{ mt: 4, width: '100%', maxWidth: '500px', mx: 'auto', p: 0 }}>
            <Typography variant="h6" sx={{
                mb: 2.5,
                fontWeight: 800,
                background: 'linear-gradient(45deg, #FFD700 30%, #FF8C00 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontSize: '1.1rem'
            }}>
                👑 Top Leave Takers ({format(currentMonth, 'MMM')})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {leaderboard.map((user, index) => {
                    const isFirst = index === 0;
                    const isTop3 = index < 3;
                    const barWidth = `${(user.count / maxCount) * 100}%`;

                    return (
                        <Box key={user.name} sx={{
                            position: 'relative',
                            bgcolor: 'rgba(255, 255, 255, 0.55)', // Glassy white
                            backdropFilter: 'blur(10px)',
                            border: isFirst ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.6)',
                            borderRadius: 4,
                            p: 1.5,
                            pl: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            boxShadow: isFirst ? '0 8px 30px rgba(255, 215, 0, 0.25)' : '0 4px 12px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-2px)' },
                            overflow: 'hidden'
                        }}>
                            {/* Progress Bar Background */}
                            <Box sx={{
                                position: 'absolute',
                                left: 0, top: 0, bottom: 0,
                                width: barWidth,
                                bgcolor: isFirst ? 'rgba(255, 215, 0, 0.1)' : 'rgba(124, 77, 255, 0.05)',
                                zIndex: 0
                            }} />

                            {/* Rank Badge */}
                            <Box sx={{
                                zIndex: 1,
                                fontWeight: 900,
                                color: isFirst ? '#B8860B' : '#888',
                                minWidth: '24px',
                                textAlign: 'center'
                            }}>
                                {isFirst ? '🏆' : `#${index + 1}`}
                            </Box>

                            {/* Avatar */}
                            <Avatar sx={{
                                zIndex: 1,
                                width: 36,
                                height: 36,
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                bgcolor: stringToColor(user.name),
                                border: '2px solid #fff'
                            }}>
                                {user.name.charAt(0)}
                            </Avatar>

                            {/* Name */}
                            <Typography sx={{
                                zIndex: 1,
                                flex: 1,
                                fontWeight: isFirst ? 800 : 700,
                                color: '#333'
                            }}>
                                {user.name}
                            </Typography>

                            {/* Count Badge */}
                            <Box sx={{
                                zIndex: 1,
                                bgcolor: isFirst ? '#FFD700' : 'rgba(124, 77, 255, 0.1)',
                                color: isFirst ? '#000' : '#7c4dff',
                                fontWeight: 800,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 3,
                                fontSize: '0.85rem'
                            }}>
                                {user.count} days
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default MonthLeaderboard;
