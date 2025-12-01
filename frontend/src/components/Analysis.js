import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { Box, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress, Grid, Select, Typography } from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import SendMailDialog from "./SendMailDialog";
import AnalysisCharts from "./AnalysisCharts";
import AnalysisTable from "./AnalysisTable";
import DonutChartOnly from "./DonutChartOnly";

import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";

const Analysis = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState(false);
  const { employees = [], activeLeaves = [], loading } = useContext(AppContext);
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [sendMailOpen, setSendMailOpen] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailAppPassword, setMailAppPassword] = useState("");
  const [mailError, setMailError] = useState(false);
  const [mailAppPasswordError, setMailAppPasswordError] = useState(false);
  const [mailSuccess, setMailSuccess] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');


  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Email validation and send handler
  const handleSendMail = () => {
    const email = mailTo.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMailError(true);
      return;
    }
    setMailError(false);

    if (!mailAppPassword) {
      setMailAppPasswordError(true);
      return;
    }
    setMailAppPasswordError(false);

    setSendMailOpen(false);
    setMailSuccess(true);

    // --- Prepare data for backend-generated weekly leave table ---
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const payload = {
      to: mailTo,
      user: mailTo,
      appPassword: mailAppPassword,
      subject: 'Leave update for this week',
      employees,
      activeLeaves,
      weekStart: weekStart.toISOString()
    };
    console.log('Send Mail Payload:', payload);
    fetch(`${process.env.REACT_APP_API_URL || '/api'}/send-leave-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMailSuccess(true);
        } else {
          setMailError(true);
        }
      })
      .catch(() => setMailError(true));
  };

  // Excel Download Handler
  // Helper to get number of weeks in the selected month
  const getWeeksInMonth = (month, year) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Math.ceil(lastDay / 7);
  };

  const handleDownloadExcel = async () => {
    const currentMonth = startMonth;
    const currentYear = year;
    // Calculate week start and end for selected week
    const weekStartDate = (selectedWeek - 1) * 7 + 1;
    const weekEndDate = Math.min(selectedWeek * 7, new Date(currentYear, currentMonth + 1, 0).getDate());
    const weekStart = new Date(currentYear, currentMonth, weekStartDate);
    const weekDays = [];
    let d = weekStartDate;
    while (d <= weekEndDate) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 1 = Monday, 5 = Friday
        weekDays.push(dateObj);
      }
      d++;
    }
    const payload = {
      employees,
      leaves: activeLeaves,
      weekStart: weekStart.toISOString(),
      weekDays: weekDays.map(d => d.toISOString())
    };
    const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/download-leave-excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setAlertMsg('Failed to generate Excel file.');
      setAlertOpen(true);
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LeaveTracker_Week${selectedWeek}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    setExcelModalOpen(false);
    setExcelSuccess(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress size={60} thickness={4} sx={{ color: '#7c4dff' }} />
      </Box>
    );
  }

  return (
    <div style={{ padding: '20px', margin: 0, width: '100%', boxSizing: 'border-box' }}>
      {/* Excel Success Snackbar */}
      <Snackbar
        open={excelSuccess}
        autoHideDuration={2500}
        onClose={() => setExcelSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ fontWeight: 700, fontSize: 16 }}>
          Excel sheet downloaded successfully
        </Alert>
      </Snackbar>
      {/* Excel Error Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ fontWeight: 700, fontSize: 16 }}>
          {alertMsg}
        </Alert>
      </Snackbar>
      {/* Excel Week Modal */}
      <Dialog open={excelModalOpen} onClose={() => setExcelModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Select Week</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Select Week"
            value={selectedWeek}
            onChange={e => setSelectedWeek(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          >
            {Array.from({ length: getWeeksInMonth(startMonth, year) }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{`Week ${i + 1}`}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcelModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDownloadExcel} variant="contained">Download</Button>
        </DialogActions>
      </Dialog>

      {/* Send Mail Dialog */}
      <SendMailDialog
        open={sendMailOpen}
        onClose={() => setSendMailOpen(false)}
        onSend={handleSendMail}
        mailTo={mailTo}
        setMailTo={setMailTo}
        mailAppPassword={mailAppPassword}
        setMailAppPassword={setMailAppPassword}
        mailError={mailError}
        mailAppPasswordError={mailAppPasswordError}
      />

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        <Box>
          <span style={{
            display: 'block',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            letterSpacing: 1,
            color: '#fff',
            textShadow: '0 2px 12px rgba(0,0,0,0.1)',
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            lineHeight: 1.1,
            textAlign: 'left',
          }}>
            Analysis
          </span>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 1 }}
            onClick={() => setSendMailOpen(true)}
            startIcon={<span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg></span>}
          >
            Send a Mail
          </Button>

          <Button
            variant="contained"
            sx={{ bgcolor: '#00c853', color: '#fff', fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 1 }}
            onClick={() => setExcelModalOpen(true)}
            startIcon={<span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M5 20h14v-2H5v2zM7 4h10v2H7V4zm5 4c-1.1 0-2 .9-2 2v6h2v-6h2v6h2v-6c0-1.1-.9-2-2-2z" /></svg></span>}
          >
            Download Excel
          </Button>
        </Box>
      </Box>

      {/* Main Content Card */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: '#fff', minHeight: '80vh' }}>

        {/* Filter Row */}
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={4} width="100%">
          {/* Employee Filter */}
          <Box flex={1} display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2" fontWeight={700} color="#5e35b1" sx={{ ml: 0.5 }}>
              Employee Name
            </Typography>
            <Select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              variant="outlined"
              displayEmpty
              fullWidth
              sx={{
                height: 56,
                borderRadius: 3,
                bgcolor: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff', borderWidth: 2 },
                fontWeight: 600,
                color: '#424242',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(124,77,255,0.15)',
                }
              }}
              MenuProps={{ PaperProps: { sx: { borderRadius: 3, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } } }}
            >
              <MenuItem value="All" sx={{ fontWeight: 500 }}>All Employees</MenuItem>
              {employees.map(emp => (
                <MenuItem key={emp.name} value={emp.name} sx={{ fontWeight: 500 }}>{emp.name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Year Filter */}
          <Box flex={1} display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2" fontWeight={700} color="#5e35b1" sx={{ ml: 0.5 }}>
              Year
            </Typography>
            <Select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              variant="outlined"
              fullWidth
              sx={{
                height: 56,
                borderRadius: 3,
                bgcolor: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff', borderWidth: 2 },
                fontWeight: 600,
                color: '#424242',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(124,77,255,0.15)',
                }
              }}
              MenuProps={{ PaperProps: { sx: { borderRadius: 3, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } } }}
            >
              {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <MenuItem key={y} value={y} sx={{ fontWeight: 500 }}>{y}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* From Month Filter */}
          <Box flex={1} display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2" fontWeight={700} color="#5e35b1" sx={{ ml: 0.5 }}>
              From Month
            </Typography>
            <Select
              value={startMonth}
              onChange={e => setStartMonth(Number(e.target.value))}
              variant="outlined"
              fullWidth
              sx={{
                height: 56,
                borderRadius: 3,
                bgcolor: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff', borderWidth: 2 },
                fontWeight: 600,
                color: '#424242',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(124,77,255,0.15)',
                }
              }}
              MenuProps={{ PaperProps: { sx: { borderRadius: 3, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxHeight: 300 } } }}
            >
              {monthNames.map((m, idx) => (
                <MenuItem key={m} value={idx} sx={{ fontWeight: 500 }}>{m}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* To Month Filter */}
          <Box flex={1} display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2" fontWeight={700} color="#5e35b1" sx={{ ml: 0.5 }}>
              To Month
            </Typography>
            <Select
              value={endMonth}
              onChange={e => setEndMonth(Number(e.target.value))}
              variant="outlined"
              fullWidth
              sx={{
                height: 56,
                borderRadius: 3,
                bgcolor: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c4dff', borderWidth: 2 },
                fontWeight: 600,
                color: '#424242',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(124,77,255,0.15)',
                }
              }}
              MenuProps={{ PaperProps: { sx: { borderRadius: 3, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxHeight: 300 } } }}
            >
              {monthNames.map((m, idx) => (
                <MenuItem key={m} value={idx} disabled={idx < startMonth} sx={{ fontWeight: 500 }}>{m}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {/* Charts Grid */}
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} lg={6} display="flex" flexDirection="column" gap={4}>
            <Box>
              {/* Donut Chart Only (no line/bar) */}
              <DonutChartOnly startMonth={startMonth} endMonth={endMonth} year={year} />
            </Box>
            <Box>
              {/* Employee Table Card */}
              <AnalysisTable
                startMonth={startMonth}
                endMonth={endMonth}
                setStartMonth={setStartMonth}
                setEndMonth={setEndMonth}
                year={year}
                setYear={setYear}
                selectedEmployee={selectedEmployee}
              />
            </Box>
          </Grid>
          {/* Right Column */}
          <Grid item xs={12} lg={6} display="flex" flexDirection="column" gap={4}>
            <Box>
              {/* First Bar Chart Card (monthly leave counts only) */}
              <AnalysisCharts month={startMonth} year={year} type="bar1" />
            </Box>
            <Box>
              {/* Second Bar Chart Card */}
              <AnalysisCharts month={startMonth} year={year} type="bar2" />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default Analysis;
