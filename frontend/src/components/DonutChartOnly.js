import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Typography, Box, ToggleButton, ToggleButtonGroup, IconButton } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { format, isSameDay, addDays, subDays } from "date-fns";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const COLORS = ["#66bb6a", "#ef5350", "#fff176", "#8bc34a"];
const LEAVE_TYPES = ["Planned", "Emergency", "Sick", "HalfDay"];

export default function DonutChartOnly({ startMonth, endMonth, year }) {
  const { activeLeaves } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('month'); // 'day', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartType, setChartType] = useState('donut'); // 'donut', 'pie'

  // Handle View Change
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // Filter Logic
  const filteredLeaves = activeLeaves.filter(l => {
    const d = new Date(l.date);
    if (viewMode === 'day') {
      return isSameDay(d, selectedDate);
    } else if (viewMode === 'year') {
      return d.getFullYear() === year;
    } else {
      // Month (Default) - Uses props
      return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() <= endMonth;
    }
  });

  const donutData = LEAVE_TYPES.map(type => ({
    name: type,
    value: filteredLeaves.filter(l => l.type === type).length
  }));

  // Helper for Title
  const getTitle = () => {
    if (viewMode === 'day') return `Leaves on ${format(selectedDate, "dd MMM yyyy")}`;
    if (viewMode === 'year') return `Total Leaves (${year})`;
    return `Total Leaves (${startMonth === endMonth ? format(new Date(year, startMonth), "MMM") : `${format(new Date(year, startMonth), "MMM")} - ${format(new Date(year, endMonth), "MMM")}`})`;
  };

  return (
    <Box sx={{ height: '100%', width: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>

      {/* Header with Controls */}
      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.2rem',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              color: '#5e35b1',
              letterSpacing: 0.5,
              textAlign: 'left'
            }}
          >
            {getTitle()}
          </Typography>

          <Box display="flex" gap={1}>
            {/* Chart Type Toggle */}
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              sx={{
                height: 32,
                '& .MuiToggleButton-root': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#424242',
                  borderColor: '#e0e0e0',
                  '&.Mui-selected': {
                    bgcolor: '#673ab7',
                    color: '#fff',
                    '&:hover': { bgcolor: '#5e35b1' }
                  }
                }
              }}
            >
              <ToggleButton value="donut">🍩</ToggleButton>
              <ToggleButton value="pie">🥧</ToggleButton>
            </ToggleButtonGroup>

            {/* Time View Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
              sx={{
                height: 32,
                '& .MuiToggleButton-root': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#7c4dff',
                  borderColor: '#b39ddb',
                  '&.Mui-selected': {
                    bgcolor: '#7c4dff',
                    color: '#fff',
                    '&:hover': { bgcolor: '#651fff' }
                  }
                }
              }}
            >
              <ToggleButton value="day">Day</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
              <ToggleButton value="year">Year</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Date Navigation for Day View */}
        {viewMode === 'day' && (
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 0.5 }}>
            <IconButton onClick={() => setSelectedDate(subDays(selectedDate, 1))} size="small" sx={{ p: 0.5 }}>
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography variant="body2" fontWeight={700} color="#555">
              {format(selectedDate, "EEE, dd MMM")}
            </Typography>
            <IconButton onClick={() => setSelectedDate(addDays(selectedDate, 1))} size="small" sx={{ p: 0.5 }}>
              <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}
      </Box>


      <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? 80 : 0}
              outerRadius={110}
              paddingAngle={chartType === 'donut' ? 0 : 2}
              isAnimationActive={true}
            >
              {donutData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, fontWeight: 700 }}
            />
            {/* Centered Text for DONUT only */}
            {chartType === 'donut' && (
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#333">
                <tspan x="50%" dy="-10" fontSize="14" fontWeight="600">Total</tspan>
                <tspan x="50%" dy="24" fontSize="28" fontWeight="800" fill="#7c4dff">{filteredLeaves.length}</tspan>
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Compact Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
        {donutData.map((item, idx) => (
          <Box key={item.name} display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[idx] }} />
            <Typography variant="caption" fontWeight={700} color="#555">
              {item.name}: {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
