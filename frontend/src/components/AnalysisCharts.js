import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line, Legend } from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = ["#66bb6a", "#ef5350", "#fff176", "#8bc34a"];
const LEAVE_TYPES = ["Planned", "Emergency", "Sick", "HalfDay"];

function AnalysisCharts({ month, year, type, onViewDetails }) {
  const { activeLeaves } = useContext(AppContext);

  // Donut chart data for selected month
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLeaves = activeLeaves.filter(l => l.date.startsWith(monthStr));
  const donutData = LEAVE_TYPES.map(type => ({
    name: type,
    value: monthLeaves.filter(l => l.type === type).length
  }));

  // Monthly leave counts (bar/line chart)
  const months = Array.from({ length: 12 }, (_, i) => i);
  const monthlyCounts = months.map(m => {
    const mStr = `${year}-${String(m + 1).padStart(2, '0')}`;
    return {
      month: format(new Date(year, m), "MMM"),
      Planned: activeLeaves.filter(l => l.date.startsWith(mStr) && l.type === "Planned").length,
      Emergency: activeLeaves.filter(l => l.date.startsWith(mStr) && l.type === "Emergency").length,
      Sick: activeLeaves.filter(l => l.date.startsWith(mStr) && l.type === "Sick").length,
      HalfDay: activeLeaves.filter(l => l.date.startsWith(mStr) && l.type === "HalfDay").length,
      Total: activeLeaves.filter(l => l.date.startsWith(mStr)).length
    };
  });

  // Yearly totals (bar chart)
  const years = Array.from(new Set(activeLeaves.map(l => l.date.slice(0, 4))));
  const yearlyCounts = years.map(y => ({
    year: y,
    Total: activeLeaves.filter(l => l.date.startsWith(y)).length
  }));

  // Empty State Component
  const EmptyState = () => (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" minHeight={200} opacity={0.6}>
      <Typography variant="h6" fontWeight={700} color="textSecondary">No Data Available</Typography>
      <Typography variant="body2" color="textSecondary">There are no leave records for this period.</Typography>
    </Box>
  );

  // Glassmorphism Tooltip Style
  const tooltipStyle = {
    padding: '12px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.18)'
  };

  if (type === 'donut') {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1">Leaves Breakdown ({format(new Date(year, month), "MMMM yyyy")})</Typography>
        <Box flexGrow={1} minHeight={250}>
          {donutData.every(d => d.value === 0) ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label>
                  {donutData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>
    );
  }
  if (type === 'bar1') {
    // Dynamically determine max Y value and generate ticks
    const maxValue = Math.max(...monthlyCounts.map(m => m.Total));
    // Round up to nearest 5 or 10 for a clean axis
    const roundTo = maxValue > 20 ? 10 : 5;
    const yMax = Math.ceil((maxValue + 1) / roundTo) * roundTo;
    // Generate more ticks: every 2 if small, every 5/10 if large
    let yTicks = [];
    if (yMax <= 20) {
      for (let i = 0; i <= yMax; i += 2) yTicks.push(i);
      if (yTicks[yTicks.length - 1] !== yMax) yTicks.push(yMax);
    } else {
      for (let i = 0; i <= yMax; i += roundTo) yTicks.push(i);
      if (yTicks[yTicks.length - 1] !== yMax) yTicks.push(yMax);
    }
    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Paper sx={tooltipStyle}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{label}</Typography>
            {payload.map((entry, idx) => (
              <div key={entry.name} style={{ color: entry.fill, fontWeight: 600, fontSize: 14, margin: '2px 0' }}>
                ● {entry.name}: <span style={{ fontWeight: 800 }}>{entry.value}</span>
              </div>
            ))}
          </Paper>
        );
      }
      return null;
    };
    return (
      <Box sx={{ height: '100%', width: '100%', minHeight: 350 }}>
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
          Monthly Leave Counts ({year})
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={monthlyCounts} barGap={2} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontWeight: 600, fontSize: 13, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} axisLine={{ stroke: '#eee' }} tickLine={false} />
            <YAxis
              tick={{ fontWeight: 600, fontSize: 13, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, yMax]}
              ticks={yTicks}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 77, 255, 0.04)' }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: 13, fontFamily: 'Inter' }} />
            <Bar dataKey="Planned" fill="#66bb6a" radius={[4, 4, 4, 4]} isAnimationActive />
            <Bar dataKey="Emergency" fill="#ef5350" radius={[4, 4, 4, 4]} isAnimationActive />
            <Bar dataKey="Sick" fill="#fff176" radius={[4, 4, 4, 4]} isAnimationActive />
            <Bar dataKey="HalfDay" fill="#8bc34a" radius={[4, 4, 4, 4]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }
  if (type === 'bar2') {
    // Custom Tooltip for yearly bar
    const CustomTooltipYear = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Paper sx={tooltipStyle}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{label}</Typography>
            {payload.map((entry, idx) => (
              <div key={entry.name} style={{ color: '#7c4dff', fontWeight: 600, fontSize: 14, margin: '2px 0' }}>
                ● Total: <span style={{ fontWeight: 800 }}>{entry.value}</span>
              </div>
            ))}
          </Paper>
        );
      }
      return null;
    };
    return (
      <Box sx={{ height: '100%', width: '100%', minHeight: 350 }}>
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
          Yearly Total Leaves
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={yearlyCounts} barGap={4} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontWeight: 600, fontSize: 13, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} axisLine={{ stroke: '#eee' }} tickLine={false} />
            <YAxis tick={{ fontWeight: 600, fontSize: 13, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipYear />} cursor={{ fill: 'rgba(124, 77, 255, 0.04)' }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: 13, fontFamily: 'Inter' }} />
            <Bar dataKey="Total" fill="#7c4dff" radius={[4, 4, 4, 4]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }
  return null;

}

export default AnalysisCharts;
