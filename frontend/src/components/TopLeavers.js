import React, { useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress } from '@mui/material';

const TopLeavers = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch top leavers for current month
        const fetchStats = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/analysis/top-leavers`);
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch top leavers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: '#fff', mt: 4 }}>
            <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#5e35b1' }}>
                🏆 The "Relaxation Leaderboard"
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                A fun look at who's mastering the art of time off this month!
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Days Off</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fav Excuse</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stats.slice(0, 5).map((row, index) => (
                            <TableRow key={row.name}>
                                <TableCell>
                                    {index === 0 ? "👑" : index + 1}
                                </TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.totalDays}</TableCell>
                                <TableCell>{row.topType}</TableCell>
                            </TableRow>
                        ))}
                        {stats.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No days off yet! Everyone is working hard!</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default TopLeavers;
