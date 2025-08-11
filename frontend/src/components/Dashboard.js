import React from "react";
import { Box, Grid, Card, CardContent, Typography, Avatar } from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const statCards = [
  {
    label: "Total Employees",
    value: "-",
    icon: <GroupIcon fontSize="large" />,
    color: "#1976d2",
    bg: "linear-gradient(135deg, #e3f2fd 0%, #1976d2 100%)"
  },
  {
    label: "Leaves This Month",
    value: "-",
    icon: <CalendarMonthIcon fontSize="large" />,
    color: "#43a047",
    bg: "linear-gradient(135deg, #e8f5e9 0%, #43a047 100%)"
  },
  {
    label: "Pending Approvals",
    value: "-",
    icon: <PendingActionsIcon fontSize="large" />,
    color: "#fb8c00",
    bg: "linear-gradient(135deg, #fff3e0 0%, #fb8c00 100%)"
  }
];

const Dashboard = () => (
  <Box sx={{ px: 4, py: 4, bgcolor: '#f6f8fa', minHeight: '100vh', fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif' }}>
    <Typography variant="h4" fontWeight={700} mb={4} color="#222">Dashboard Overview</Typography>
    <Grid container spacing={3}>
      {statCards.map((card, idx) => (
        <Grid item xs={12} md={4} key={card.label}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: 4,
            background: card.bg,
            color: card.color,
            minHeight: 140,
            display: 'flex',
            alignItems: 'center',
            px: 3,
            py: 2.5
          }}>
            <Avatar sx={{ bgcolor: card.color, width: 56, height: 56, mr: 3 }}>
              {card.icon}
            </Avatar>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#222', mb: 0.5 }}>{card.label}</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>{card.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Dashboard;
