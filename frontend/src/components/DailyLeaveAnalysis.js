import React, { useContext, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { Box, Typography, IconButton, Tooltip, Paper, Chip } from "@mui/material";
import { format, addDays, subDays, isSameDay, addMonths, subMonths, addYears, subYears } from "date-fns";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DailyLeaveAnalysis = () => {
    const { activeLeaves } = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day'); // 'day', 'month', 'year'
    const [copied, setCopied] = useState(false);

    // Navigation Helpers
    const handlePrev = () => {
        if (viewMode === 'day') setSelectedDate(subDays(selectedDate, 1));
        else if (viewMode === 'month') setSelectedDate(subMonths(selectedDate, 1));
        else if (viewMode === 'year') setSelectedDate(subYears(selectedDate, 1));
    };

    const handleNext = () => {
        if (viewMode === 'day') setSelectedDate(addDays(selectedDate, 1));
        else if (viewMode === 'month') setSelectedDate(addMonths(selectedDate, 1));
        else if (viewMode === 'year') setSelectedDate(addYears(selectedDate, 1));
    };

    // Data Processing
    const reportData = useMemo(() => {
        // DAY VIEW: Return raw list of leaves
        if (viewMode === 'day') {
            return activeLeaves
                .filter(leave => isSameDay(new Date(leave.date), selectedDate))
                .map(l => ({ name: l.employee, type: l.type, isLeave: true }));
        }

        // MONTH/YEAR VIEW: Aggregate counts
        let filtered = [];
        if (viewMode === 'month') {
            filtered = activeLeaves.filter(leave => {
                const d = new Date(leave.date);
                return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
            });
        } else { // year
            filtered = activeLeaves.filter(leave => {
                const d = new Date(leave.date);
                return d.getFullYear() === selectedDate.getFullYear();
            });
        }

        // Aggregate
        const counts = {};
        filtered.forEach(l => {
            counts[l.employee] = (counts[l.employee] || 0) + 1;
        });

        // Convert to array and sort
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count, isAggregated: true }))
            .sort((a, b) => b.count - a.count);

    }, [activeLeaves, selectedDate, viewMode]);

    // Format Header Text
    const dateLabel = useMemo(() => {
        if (viewMode === 'day') return format(selectedDate, "EEE, dd MMM yyyy");
        if (viewMode === 'month') return format(selectedDate, "MMMM yyyy");
        return format(selectedDate, "yyyy");
    }, [selectedDate, viewMode]);

    // Handle Copy to Clipboard
    const handleCopy = () => {
        let header = `🌴 LEAVE REPORT: ${dateLabel} 🌴\n\n`;
        let content = "";

        if (reportData.length === 0) {
            content = "No leaves recorded! 🚀";
        } else if (viewMode === 'day') {
            content = reportData.map(l => `• ${l.name} - ${l.type}`).join("\n");
        } else {
            content = reportData.map((d, i) => `#${i + 1} ${d.name}: ${d.count} days`).join("\n");
        }

        const footer = `\n\nTotal: ${reportData.length} records.`;
        navigator.clipboard.writeText(header + content + footer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box sx={{ p: 0, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography
                    sx={{
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                        color: '#5e35b1',
                        letterSpacing: 0.5
                    }}
                >
                    {viewMode === 'day' ? 'Daily Report' : viewMode === 'month' ? 'Monthly Summary' : 'Yearly Overview'}
                </Typography>

                <Tooltip title={copied ? "Copied!" : "Copy Report"} arrow>
                    <IconButton onClick={handleCopy} color="primary" sx={{ bgcolor: 'rgba(124, 77, 255, 0.1)', '&:hover': { bgcolor: 'rgba(124, 77, 255, 0.2)' } }}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* View Modes */}
            <Box display="flex" gap={1} mb={2} p={0.5} bgcolor="#f5f5f5" borderRadius={2}>
                {['days', 'month', 'year'].map((mode) => (
                    <Box
                        key={mode}
                        onClick={() => setViewMode(mode === 'days' ? 'day' : mode)}
                        sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: 0.5,
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            bgcolor: viewMode === (mode === 'days' ? 'day' : mode) ? '#fff' : 'transparent',
                            boxShadow: viewMode === (mode === 'days' ? 'day' : mode) ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: viewMode === (mode === 'days' ? 'day' : mode) ? '#5e35b1' : '#757575',
                            transition: 'all 0.2s'
                        }}
                    >
                        {mode.toUpperCase()}
                    </Box>
                ))}
            </Box>

            {/* Date Navigation */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} sx={{ bgcolor: '#ede7f6', p: 1, borderRadius: 2 }}>
                <IconButton onClick={handlePrev} size="small">
                    <ArrowBackIosNewIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                </IconButton>

                <Box display="flex" alignItems="center" gap={1}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography fontWeight={700} color="#4527a0" fontSize="0.95rem">
                        {dateLabel}
                    </Typography>
                </Box>

                <IconButton onClick={handleNext} size="small">
                    <ArrowForwardIosIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                </IconButton>
            </Box>

            {/* Content Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, maxHeight: '350px' }}>
                {reportData.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={150} opacity={0.6} gap={1}>
                        <Typography fontSize="2rem">🚀</Typography>
                        <Typography fontWeight={600} color="#999" fontSize="0.9rem">No Data Found</Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={1}>
                        {reportData.map((item, index) => (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1px solid #f3e5f5',
                                    borderRadius: 3,
                                    bgcolor: index < 3 && viewMode !== 'day' ? 'rgba(255, 235, 59, 0.1)' : '#fff', // Highlight top 3
                                    '&:hover': { bgcolor: '#fafafa' }
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    {/* Initials Avatar */}
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        bgcolor: viewMode !== 'day' && index < 3 ? '#fff59d' : '#e8eaf6',
                                        color: viewMode !== 'day' && index < 3 ? '#f57f17' : '#3f51b5',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        border: viewMode !== 'day' && index < 3 ? '1px solid #fbc02d' : 'none'
                                    }}>
                                        {viewMode !== 'day' && index < 3 ? `#${index + 1}` : item.name.charAt(0)}
                                    </Box>
                                    <Typography fontWeight={600} fontSize="0.9rem" color="#424242">
                                        {item.name}
                                    </Typography>
                                </Box>

                                {item.isAggregated ? (
                                    <Chip
                                        label={`${item.count} Days`}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            height: 24,
                                            bgcolor: '#e3f2fd',
                                            color: '#1565c0',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ) : (
                                    <Chip
                                        label={item.type}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            height: 24,
                                            bgcolor: item.type === 'Sick' ? '#ffebee' : item.type === 'Planned' ? '#e8f5e9' : '#fff3e0',
                                            color: item.type === 'Sick' ? '#c62828' : item.type === 'Planned' ? '#2e7d32' : '#ef6c00',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                )}
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Footer Summary */}
            <Box mt={2} pt={2} borderTop="1px dashed #e0e0e0">
                <Typography variant="body2" color="#757575" align="center" fontSize="0.85rem">
                    {viewMode === 'day' ? (
                        <>Total Absent: <b>{reportData.length}</b></>
                    ) : (
                        <>Total People on Leave: <b>{reportData.length}</b></>
                    )}
                </Typography>
            </Box>
        </Box>
    );
};

export default DailyLeaveAnalysis;
