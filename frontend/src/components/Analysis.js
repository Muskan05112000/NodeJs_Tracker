import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { Box, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from "@mui/material";
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
  const { employees = [], leaves = [] } = useContext(AppContext);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [sendMailOpen, setSendMailOpen] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailAppPassword, setMailAppPassword] = useState("");
  const [mailError, setMailError] = useState(false);
  const [mailAppPasswordError, setMailAppPasswordError] = useState(false);
  const [mailSuccess, setMailSuccess] = useState(false);
  const [sendSmsOpen, setSendSmsOpen] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");
  const [smsPhoneError, setSmsPhoneError] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);

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
      leaves,
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
    const currentMonth = month;
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
      leaves,
      weekStart: weekStart.toISOString(),
      weekDays: weekDays.map(d => d.toISOString())
    };
    const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/download-leave-excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      alert('Failed to generate Excel file.');
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

  return (
    <div style={{ paddingLeft: 10, margin: 0 }}>
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
            {Array.from({ length: getWeeksInMonth(month, year) }, (_, i) => (
              <option key={i+1} value={i+1}>{`Week ${i+1}`}</option>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, width: '100%' }}>
        <span style={{
          display: 'block',
          fontWeight: 900,
          fontSize: 38,
          letterSpacing: 1,
          background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 12px #b388ff22, 0 1px 1px #fff',
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          lineHeight: 1.1,
          margin: '28px 0 30px 0',
          textAlign: 'left',
        }}>
          Analysis
        </span>
        <Box display="flex" columnGap={3} alignItems="center">
          <Button
            variant="contained"
            sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 1 }}
            onClick={() => setSendMailOpen(true)}
            startIcon={<span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></span>}
          >
            Send a Mail
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#7c4dff', color: '#fff', fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 1 }}
            onClick={() => setSendSmsOpen(true)}
            startIcon={<span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H6v-2h12v2zm0-4H6V8h12v4z"/></svg></span>}
          >
            Send a SMS
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#00c853', color: '#fff', fontWeight: 700, fontSize: 18, px: 4, py: 1.5, borderRadius: 4, boxShadow: 2, textTransform: 'none', letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 1 }}
            onClick={handleDownloadExcel}
            startIcon={<span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M5 20h14v-2H5v2zM7 4h10v2H7V4zm5 4c-1.1 0-2 .9-2 2v6h2v-6h2v6h2v-6c0-1.1-.9-2-2-2z"/></svg></span>}
          >
            Download Excel
          </Button>



          <Snackbar
            open={mailSuccess}
            autoHideDuration={2500}
            onClose={() => setMailSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ fontWeight: 700, fontSize: 16 }}>
              Mail Sent Successfully
            </Alert>
          </Snackbar>
          {/* Send SMS Modal */}
          <Dialog open={sendSmsOpen} onClose={() => setSendSmsOpen(false)} maxWidth="xs" fullWidth
            PaperProps={{
              style: {
                background: 'rgba(255,255,255,0.98)',
                borderRadius: 32,
                boxShadow: '0 10px 40px 0 rgba(124,77,255,0.20)',
                padding: 0,
                fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              },
              elevation: 0
            }}
            BackdropProps={{
              style: {
                background: 'rgba(124,77,255,0.03)'
              }
            }}
          >
            <DialogTitle sx={{
              textAlign: 'center',
              fontWeight: 900,
              fontSize: 30,
              color: '#7c4dff',
              letterSpacing: 1,
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 12px #b388ff33',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24"><path fill="#7c4dff" d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H6v-2h12v2zm0-4H6V8h12v4z"/></svg>
              </span>
              Send SMS
            </DialogTitle>

            <DialogContent dividers sx={{ px: 4, py: 2 }}>
              <TextField
                label="Phone Number"
                type="tel"
                value={smsPhone}
                onChange={e => {
                  setSmsPhone(e.target.value);
                  setSmsPhoneError(false);
                }}
                fullWidth
                variant="outlined"
                sx={{ mt: 2, mb: 2, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.58)',
                    boxShadow: '0 2px 16px 0 rgba(124,77,255,0.11) inset',
                    border: '2px solid #a084e8',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: 19,
                    color: '#4b2aad',
                    transition: 'background 0.18s, box-shadow 0.18s',
                    '&:hover': { background: 'rgba(255,255,255,0.70)', border: '2px solid #a084e8', outline: 'none', boxShadow: 'none' },
                    '&.Mui-focused': { background: 'rgba(255,255,255,0.90)', border: '2px solid #7c4dff', outline: 'none', boxShadow: 'none' }
                  },
                  '& .MuiInputLabel-root': { fontWeight: 800, color: '#7c4dff', fontSize: 18 }
                }}
                placeholder="Enter phone number"
                error={smsPhoneError}
                helperText={smsPhoneError ? 'Enter a valid phone number' : ''}
                InputLabelProps={{ shrink: true, style: { fontWeight: 800, color: '#7c4dff', fontSize: 18 } }}
                InputProps={{ style: { marginTop: 12 } }}
              />
            </DialogContent>
            <DialogActions style={{ justifyContent: 'center', gap: 24, padding: '0 28px 32px 28px', marginTop: 8 }}>
              <Button onClick={() => {
                setSendSmsOpen(false);
                setSmsPhone("");
                setSmsPhoneError(false);
              }} variant="outlined" sx={{
                borderRadius: 10,
                fontWeight: 700,
                px: 4,
                py: 1.2,
                fontSize: 17,
                boxShadow: 2,
                background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
                border: '2px solid #b39ddb',
                color: '#7c4dff',
                fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                '&:hover': { background: '#ede7f6', borderColor: '#7c4dff', color: '#5e35b1' },
                '&:active': { background: '#d1c4e9', borderColor: '#7c4dff', color: '#5e35b1' }
              }}>
                CANCEL
              </Button>
              <Button
                onClick={() => {
                  const phone = smsPhone.trim();
                  const phoneRegex = /^\d{10,15}$/;
                  if (!phoneRegex.test(phone)) {
                    setSmsPhoneError(true);
                    return;
                  }
                  setSmsPhoneError(false);
                  setSendSmsOpen(false);
                  setSmsSuccess(false);
                  // Prepare data for backend
                  const today = new Date();
                  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
                  fetch(`${process.env.REACT_APP_API_URL || '/api'}/send-leave-sms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phone,
                      employees,
                      leaves,
                      weekStart: weekStart.toISOString()
                    })
                  })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setSmsSuccess(true);
                      } else {
                        setSmsPhoneError(true);
                      }
                    })
                    .catch(() => setSmsPhoneError(true));
                }}
                variant="contained"
                disabled={!smsPhone || smsPhoneError}
                sx={{
                  borderRadius: 10,
                  fontWeight: 800,
                  px: 4,
                  py: 1.2,
                  fontSize: 17,
                  boxShadow: 2,
                  background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
                  color: '#fff',
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  transition: 'background 0.18s, box-shadow 0.18s, transform 0.16s',
                  '&:hover': { background: 'linear-gradient(90deg, #b388ff 0%, #7c4dff 100%)', boxShadow: '0 4px 16px 0 #b388ff66', transform: 'scale(1.07)' },
                  '&:active': { boxShadow: '0 2px 8px 0 #7c4dff44', transform: 'scale(0.97)' }
                }}
              >
                SUBMIT
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={smsSuccess}
            autoHideDuration={2500}
            onClose={() => setSmsSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ fontWeight: 700, fontSize: 16 }}>
              SMS Sent Successfully
            </Alert>
          </Snackbar>

        </Box>
      </div>

      {/* Main Content Grid */}
      <Box display={{ xs: 'block', md: 'flex' }} gap={4} sx={{ ml: '15px' }}>
        {/* Left Column */}
        <Box flex={1} minWidth={320} display="flex" flexDirection="column" gap={4} >
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            {/* Donut Chart Only (no line/bar) */}
            <DonutChartOnly month={month} year={year} />
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Employee Table Card */}
            <AnalysisTable month={month} year={year} />
          </Paper>
        </Box>
        {/* Right Column */}
        <Box flex={1} minWidth={320} display="flex" flexDirection="column" gap={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            {/* First Bar Chart Card (monthly leave counts only) */}
            <AnalysisCharts month={month} year={year} type="bar1" />
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Second Bar Chart Card */}
            <AnalysisCharts month={month} year={year} type="bar2" />
          </Paper>
        </Box>
      </Box>
    </div>
  );
};

export default Analysis;
