import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const COLORS = ["#66bb6a", "#ef5350", "#fff176"];
const LEAVE_TYPES = ["Planned", "Emergency", "Sick"];

export default function DonutChartOnly({ month, year }) {
  const { leaves } = useContext(AppContext);
  const monthStr = `${year}-${String(month+1).padStart(2, '0')}`;
  const monthLeaves = leaves.filter(l => l.date.startsWith(monthStr));
  const donutData = LEAVE_TYPES.map(type => ({
    name: type,
    value: monthLeaves.filter(l => l.type === type).length
  }));

  return (
    <>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: '2.2rem',
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
        Total Leaves - {format(new Date(year, month), "MMMM")}
      </Typography>
      <ResponsiveContainer width="100%" height={420}>
        <PieChart>
          <Pie
            data={donutData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={110}
            outerRadius={155}
            isAnimationActive={false}
          >
            {donutData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
            ))}
          </Pie>
          {/* Centered Text Inside Donut */}
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Poppins, Inter, Segoe UI, Arial, sans-serif"
            fontSize="1.25rem"
            fontWeight="800"
            letterSpacing="0.5px"
            style={{ textShadow: '0 1px 6px #b388ff22' }}
            fill="#222"
          >
            <tspan x="50%" dy="0">Total Leave Taken</tspan>
            <tspan x="50%" dy="1.5em" fontWeight="700" fontSize="24" fill="#1976d2">{monthLeaves.length}</tspan>
          </text>
          <Tooltip
            contentStyle={{
              fontFamily: 'Poppins, Inter, Arial, sans-serif',
              fontSize: '1.08rem',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 8,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
              padding: '8px 16px',
              color: '#333',
            }}
            labelStyle={{
              fontWeight: 700,
              fontSize: '1.08rem',
              color: '#333',
            }}
            itemStyle={{
              fontWeight: 700,
              fontSize: '1.08rem',
              color: '#333',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'Inter, Roboto, Arial, sans-serif', fontSize: 18, fontWeight: 600 }}>
        {[{
          color: '#66bb6a',
          label: 'Planned Leaves',
          value: donutData[0].value,
          bg: 'rgba(102,187,106,0.12)'
        }, {
          color: '#ef5350',
          label: 'Emergency Leaves',
          value: donutData[1].value,
          bg: 'rgba(239,83,80,0.12)'
        }, {
          color: '#fff176',
          label: 'Sick Leaves',
          value: donutData[2].value,
          bg: 'rgba(255,241,118,0.20)'
        }].map((item, idx) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              margin: '8px 0',
              borderRadius: 24,
              transition: 'background 0.2s',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 19,
              background: 'transparent',
            }}
            onMouseOver={e => e.currentTarget.style.background = item.bg}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              fontSize: 24,
              color: item.color,
              background: item.bg,
              borderRadius: 16,
              padding: '4px 12px',
              fontWeight: 900,
              marginRight: 8,
              display: 'inline-block',
              minWidth: 30,
              textAlign: 'center',
            }}>●</span>
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 700, letterSpacing: 0.2 }}>{item.label}</span>
            <span style={{
              background: item.bg,
              borderRadius: 16,
              padding: '4px 12px',
              fontWeight: 800,
              fontSize: 20,
              marginLeft: 8,
              color: '#222',
              minWidth: 32,
              display: 'inline-block',
              textAlign: 'center',
            }}>{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
