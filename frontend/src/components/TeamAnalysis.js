import React, { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { Box, Paper, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

const COLORS = ["#7c4dff", "#ef5350", "#66bb6a", "#ffa726", "#29b6f6", "#ab47bc"];

const TeamAnalysis = ({ startMonth, endMonth, year }) => {
    const { employees, activeLeaves } = useContext(AppContext);

    const teamData = useMemo(() => {
        // 1. Initialize team counts
        const counts = {};
        employees.forEach(emp => {
            const team = emp.team || "Unassigned";
            if (!counts[team]) counts[team] = 0;
        });

        // 2. Filter leaves by date
        const filteredLeaves = activeLeaves.filter(l => {
            const d = new Date(l.date);
            return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() <= endMonth;
        });

        // 3. Aggregate counts
        filteredLeaves.forEach(l => {
            const emp = employees.find(e => e.name === l.employee);
            if (emp) {
                const team = emp.team || "Unassigned";
                counts[team] = (counts[team] || 0) + 1;
            }
        });

        // 4. Transform to array
        return Object.entries(counts)
            .map(([team, count]) => ({ team, count }))
            .sort((a, b) => b.count - a.count); // Sort by highest leaves
    }, [employees, activeLeaves, startMonth, endMonth, year]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{
                    p: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(124, 77, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4527a0' }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                        Total Leaves: <span style={{ fontWeight: 800, color: '#7c4dff' }}>{payload[0].value}</span>
                    </Typography>
                </Paper>
            );
        }
        return null;
    };

    return (
        <Box sx={{ p: 0, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography
                sx={{
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                    color: '#5e35b1',
                    letterSpacing: 0.5,
                    mb: 2,
                    textAlign: 'left'
                }}
            >
                Team-wise Leave Analysis
            </Typography>

            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 300 }}>
                {teamData.length === 0 || teamData.every(d => d.count === 0) ? (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%" opacity={0.6}>
                        <Typography fontWeight={600} color="#999">No leave data for selected period</Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart
                            data={teamData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} opacity={0.3} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="team"
                                type="category"
                                tick={{ fontWeight: 700, fontSize: 13, fill: '#546e7a' }}
                                width={100}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 77, 255, 0.05)' }} />
                            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                {teamData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Box>
    );
};

export default TeamAnalysis;
