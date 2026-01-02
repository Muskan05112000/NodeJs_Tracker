import React, { useContext, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { Box, Typography, IconButton, Tooltip, Paper, Chip } from "@mui/material";
import { format, addDays, subDays, isSameDay } from "date-fns";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DailyLeaveAnalysis = () => {
    const { activeLeaves } = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [copied, setCopied] = useState(false);

    // Filter leaves for the selected date
    const dailyLeaves = useMemo(() => {
        return activeLeaves.filter(leave => isSameDay(new Date(leave.date), selectedDate));
    }, [activeLeaves, selectedDate]);

    // Handle Copy to Clipboard
    const handleCopy = () => {
        const header = `🌴 Leave Report for ${format(selectedDate, "dd MMM yyyy")} 🌴\n\n`;
        const content = dailyLeaves.length > 0
            ? dailyLeaves.map(l => `• ${l.employee} - ${l.type}`).join("\n")
            : "No one is on leave today! 🚀";

        const footer = `\n\nTotal: ${dailyLeaves.length} on leave.`;

        navigator.clipboard.writeText(header + content + footer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box sx={{ p: 0, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                    sx={{
                        fontWeight: 900,
                        fontSize: '1.4rem',
                        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                        color: '#5e35b1',
                        letterSpacing: 0.5,
                        textAlign: 'left'
                    }}
                >
                    Daily Leave Report
                </Typography>

                <Tooltip title={copied ? "Copied!" : "Copy Report"} arrow>
                    <IconButton onClick={handleCopy} color="primary" sx={{ bgcolor: 'rgba(124, 77, 255, 0.1)', '&:hover': { bgcolor: 'rgba(124, 77, 255, 0.2)' } }}>
                        <ContentCopyIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Date Navigation */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 3 }}>
                <IconButton onClick={() => setSelectedDate(subDays(selectedDate, 1))} size="small">
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>

                <Box display="flex" alignItems="center" gap={1}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography fontWeight={700} color="#424242">
                        {format(selectedDate, "EEE, dd MMM yyyy")}
                    </Typography>
                </Box>

                <IconButton onClick={() => setSelectedDate(addDays(selectedDate, 1))} size="small">
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Content Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                {dailyLeaves.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" opacity={0.6} gap={2}>
                        <Typography fontSize="3rem">🚀</Typography>
                        <Typography fontWeight={600} color="#999">All hands on deck!</Typography>
                        <Typography variant="caption" color="#aaa" fontStyle="italic">No leaves for this date.</Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={1.5}>
                        {dailyLeaves.map((leave, index) => (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1px solid #ede7f6',
                                    borderRadius: 2,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateX(5px)', borderColor: '#b39ddb' }
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={2}>
                                    {/* Initials Avatar */}
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: '#e8eaf6',
                                        color: '#3f51b5',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem'
                                    }}>
                                        {leave.employee.charAt(0)}
                                    </Box>
                                    <Typography fontWeight={700} color="#455a64">{leave.employee}</Typography>
                                </Box>

                                <Chip
                                    label={leave.type}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: leave.type === 'Sick' ? '#ffebee' : leave.type === 'Planned' ? '#e8f5e9' : '#fff3e0',
                                        color: leave.type === 'Sick' ? '#c62828' : leave.type === 'Planned' ? '#2e7d32' : '#ef6c00',
                                    }}
                                />
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>
            {/* Footer Summary */}
            <Box mt={2} pt={2} borderTop="1px dashed #e0e0e0">
                <Typography variant="body2" color="#757575" align="center">
                    Total Absent: <b>{dailyLeaves.length}</b>
                </Typography>
            </Box>
        </Box>
    );
};

export default DailyLeaveAnalysis;
