import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line, Legend } from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = ["#66bb6a", "#ef5350", "#fff176"];
const LEAVE_TYPES = ["Planned", "Emergency", "Sick"];

function AnalysisCharts({ month, year, type, onViewDetails }) {
  const { leaves } = useContext(AppContext);

  // Donut chart data for selected month
  const monthStr = `${year}-${String(month+1).padStart(2, '0')}`;
  const monthLeaves = leaves.filter(l => l.date.startsWith(monthStr));
  const donutData = LEAVE_TYPES.map(type => ({
    name: type,
    value: monthLeaves.filter(l => l.type === type).length
  }));

  // Monthly leave counts (bar/line chart)
  const months = Array.from({ length: 12 }, (_, i) => i);
  const monthlyCounts = months.map(m => {
    const mStr = `${year}-${String(m+1).padStart(2, '0')}`;
    return {
      month: format(new Date(year, m), "MMM"),
      Planned: leaves.filter(l => l.date.startsWith(mStr) && l.type === "Planned").length,
      Emergency: leaves.filter(l => l.date.startsWith(mStr) && l.type === "Emergency").length,
      Sick: leaves.filter(l => l.date.startsWith(mStr) && l.type === "Sick").length,
      Total: leaves.filter(l => l.date.startsWith(mStr)).length
    };
  });

  // Yearly totals (bar chart)
  const years = Array.from(new Set(leaves.map(l => l.date.slice(0,4))));
  const yearlyCounts = years.map(y => ({
    year: y,
    Total: leaves.filter(l => l.date.startsWith(y)).length
  }));

  if (type === 'donut') {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1">Leaves Breakdown ({format(new Date(year, month), "MMMM yyyy")})</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label>
              {donutData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    );
  }
  if (type === 'bar1') {
    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Paper sx={{ p: 1.5, boxShadow: 3, borderRadius: 2, background: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography>
            {payload.map((entry, idx) => (
              <div key={entry.name} style={{ color: entry.fill, fontWeight: 600, fontSize: 15, margin: '2px 0' }}>
                ● {entry.name}: <span style={{ fontWeight: 800 }}>{entry.value}</span>
              </div>
            ))}
          </Paper>
        );
      }
      return null;
    };
    return (
      <Paper sx={{ p: 2 }}>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: '2.1rem',
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: 1,
            textShadow: '0 2px 12px #b388ff33',
            mb: 2
          }}
        >
          Monthly Leave Counts ({year})
        </Typography>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={monthlyCounts} barGap={2}>
            <XAxis dataKey="month" tick={{ fontWeight: 600, fontSize: 14, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} axisLine={{ stroke: '#bbb' }} tickLine={false} />
            <YAxis tick={{ fontWeight: 600, fontSize: 14, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} axisLine={{ stroke: '#bbb' }} tickLine={false} domain={[0, 15]} ticks={[0, 5, 10, 15]} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(66,165,245,0.07)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: 15, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} />
            <Bar dataKey="Planned" fill="#66bb6a" radius={[8, 8, 0, 0]} isAnimationActive />
            <Bar dataKey="Emergency" fill="#ef5350" radius={[8, 8, 0, 0]} isAnimationActive />
            <Bar dataKey="Sick" fill="#fff176" radius={[8, 8, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    );
  }
  if (type === 'bar2') {
    // Custom Tooltip for yearly bar
    const CustomTooltipYear = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Paper sx={{ p: 1.5, boxShadow: 3, borderRadius: 2, background: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography>
            {payload.map((entry, idx) => (
              <div key={entry.name} style={{ color: '#42a5f5', fontWeight: 600, fontSize: 15, margin: '2px 0' }}>
                ● Total: <span style={{ fontWeight: 800 }}>{entry.value}</span>
              </div>
            ))}
          </Paper>
        );
      }
      return null;
    };
    return (
      <Paper sx={{ p: 2 }}>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: '2.1rem',
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: 1,
            textShadow: '0 2px 12px #b388ff33',
            mb: 2
          }}
        >
          Yearly Total Leaves
        </Typography>
        <ResponsiveContainer width="100%" height={540}>
          <BarChart data={yearlyCounts} barGap={4}>
            <XAxis dataKey="year" tick={{ fontWeight: 600, fontSize: 15, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} axisLine={{ stroke: '#bbb' }} tickLine={false} />
            <YAxis tick={{ fontWeight: 600, fontSize: 15, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} axisLine={{ stroke: '#bbb' }} tickLine={false} />
            <Tooltip content={<CustomTooltipYear />} cursor={{ fill: 'rgba(66,165,245,0.07)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: 15, fontFamily: 'Inter, Roboto, Arial, sans-serif' }} />
            <Bar dataKey="Total" fill="#7c4dff" radius={[8, 8, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    );
  }
  return null;

}

export default AnalysisCharts;
