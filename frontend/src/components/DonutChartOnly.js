import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Typography, Box } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const COLORS = ["#66bb6a", "#ef5350", "#fff176", "#8bc34a"];
const LEAVE_TYPES = ["Planned", "Emergency", "Sick", "HalfDay"];

export default function DonutChartOnly({ startMonth, endMonth, year }) {
  const { activeLeaves } = useContext(AppContext);
  // Filter leaves for the selected year and month range
  const monthLeaves = activeLeaves.filter(l => {
    const d = new Date(l.date);
    return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() <= endMonth;
  });
  const donutData = LEAVE_TYPES.map(type => ({
    name: type,
    value: monthLeaves.filter(l => l.type === type).length
  }));

  return (
    <Box sx={{ height: '100%', width: '100%', minHeight: 350, display: 'flex', flexDirection: 'column' }}>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: '1.4rem',
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          color: '#5e35b1',
          letterSpacing: 0.5,
          marginBottom: 2,
          textAlign: 'left'
        }}
      >
        Total Leaves ({startMonth === endMonth ? format(new Date(year, startMonth), "MMM") : `${format(new Date(year, startMonth), "MMM")} - ${format(new Date(year, endMonth), "MMM")}`})
      </Typography>

      <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              isAnimationActive={true}
            >
              {donutData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, fontWeight: 700 }}
            />
            {/* Centered Text */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#333">
              <tspan x="50%" dy="-10" fontSize="14" fontWeight="600">Total</tspan>
              <tspan x="50%" dy="24" fontSize="28" fontWeight="800" fill="#7c4dff">{monthLeaves.length}</tspan>
            </text>
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
