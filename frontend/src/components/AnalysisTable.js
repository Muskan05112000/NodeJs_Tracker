import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Select, MenuItem } from "@mui/material";

function AnalysisTable() {
  const { employees, leaves, activeLeaves } = useContext(AppContext);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get all leaves in the selected range
  const filteredLeaves = activeLeaves.filter(l => {
    const dateObj = new Date(l.date);
    const yearMatch = dateObj.getFullYear() === selectedYear;
    const monthMatch = dateObj.getMonth() >= startMonth && dateObj.getMonth() <= endMonth;
    return yearMatch && monthMatch && (selectedEmployee === 'All' || l.employee === selectedEmployee);
  });

  // Build stats per employee
  const employeeList = selectedEmployee === 'All' ? employees : employees.filter(emp => emp.name === selectedEmployee);
  const stats = employeeList.map(emp => {
    const userLeaves = filteredLeaves.filter(l => l.employee === emp.name);
    return {
      name: emp.name,
      total: userLeaves.length
    };
  });

  return (
    <Box mt={2}>
      <Box display="flex" gap={4} mb={4} alignItems="center" justifyContent="center" sx={{
        background: 'linear-gradient(90deg, #ede7f6 0%, #b388ff 100%)',
        borderRadius: 16,
        boxShadow: '0 4px 24px 0 #b388ff33',
        p: 2.5,
        mt: 2,
        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
        maxWidth: 900,
        mx: 'auto',
      }}>
        <Box>
          <Typography fontWeight={900} mb={0.7} fontSize={18} fontFamily="Poppins, Inter, Segoe UI, Arial, sans-serif" letterSpacing={0.5} color="#5e35b1">Employee</Typography>
          <Select
            size="medium"
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
            sx={{
              minWidth: 180,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: 17,
              background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
              boxShadow: '0 2px 8px 0 #b388ff18',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              color: '#4527a0',
              '& .MuiSelect-select': { py: 1.3, px: 2 },
              '&:focus': { background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)' },
              '&:hover': { boxShadow: '0 4px 16px 0 #b388ff33', borderColor: '#7c4dff' },
              transition: 'box-shadow 0.18s, border-color 0.18s',
            }}
          >
            <MenuItem value="All">All</MenuItem>
            {employees.map(emp => (
              <MenuItem key={emp.name} value={emp.name} sx={{ fontWeight: 700, fontSize: 16 }}>{emp.name}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography fontWeight={900} mb={0.7} fontSize={18} fontFamily="Poppins, Inter, Segoe UI, Arial, sans-serif" letterSpacing={0.5} color="#5e35b1">Year</Typography>
          <Select
            size="medium"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            sx={{
              minWidth: 110,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: 17,
              background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
              boxShadow: '0 2px 8px 0 #b388ff18',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              color: '#4527a0',
              '& .MuiSelect-select': { py: 1.3, px: 2 },
              '&:focus': { background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)' },
              '&:hover': { boxShadow: '0 4px 16px 0 #b388ff33', borderColor: '#7c4dff' },
              transition: 'box-shadow 0.18s, border-color 0.18s',
            }}
          >
            {Array.from({length: 7}, (_,i) => new Date().getFullYear() - i).map(y => (
              <MenuItem key={y} value={y} sx={{ fontWeight: 700, fontSize: 16 }}>{y}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography fontWeight={900} mb={0.7} fontSize={18} fontFamily="Poppins, Inter, Segoe UI, Arial, sans-serif" letterSpacing={0.5} color="#5e35b1">From Month</Typography>
          <Select
            size="medium"
            value={startMonth}
            onChange={e => setStartMonth(Number(e.target.value))}
            sx={{
              minWidth: 120,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: 17,
              background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
              boxShadow: '0 2px 8px 0 #b388ff18',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              color: '#4527a0',
              '& .MuiSelect-select': { py: 1.3, px: 2 },
              '&:focus': { background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)' },
              '&:hover': { boxShadow: '0 4px 16px 0 #b388ff33', borderColor: '#7c4dff' },
              transition: 'box-shadow 0.18s, border-color 0.18s',
            }}
          >
            {monthNames.map((m, idx) => (
              <MenuItem key={m} value={idx} sx={{ fontWeight: 700, fontSize: 16 }}>{m}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography fontWeight={900} mb={0.7} fontSize={18} fontFamily="Poppins, Inter, Segoe UI, Arial, sans-serif" letterSpacing={0.5} color="#5e35b1">To Month</Typography>
          <Select
            size="medium"
            value={endMonth}
            onChange={e => setEndMonth(Number(e.target.value))}
            sx={{
              minWidth: 120,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: 17,
              background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
              boxShadow: '0 2px 8px 0 #b388ff18',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              color: '#4527a0',
              '& .MuiSelect-select': { py: 1.3, px: 2 },
              '&:focus': { background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)' },
              '&:hover': { boxShadow: '0 4px 16px 0 #b388ff33', borderColor: '#7c4dff' },
              transition: 'box-shadow 0.18s, border-color 0.18s',
            }}
          >
            {monthNames.map((m, idx) => (
              <MenuItem key={m} value={idx} disabled={idx < startMonth} sx={{ fontWeight: 700, fontSize: 16 }}>{m}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{
        boxShadow: '0 8px 32px 0 rgba(124,77,255,0.10)',
        borderRadius: 4,
        mt: 2,
        maxWidth: 700,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.98)',
        overflow: 'hidden',
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #7c4dff11 0%, #ede7f6 100%)', height: 62 }}>
              <TableCell sx={{
                fontWeight: 900,
                fontSize: 21,
                fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                letterSpacing: 0.6,
                color: '#4527a0',
                textShadow: '0 2px 8px #b388ff22',
                py: 2,
                px: 3,
              }}>Employee Name</TableCell>
              <TableCell sx={{
                fontWeight: 900,
                fontSize: 21,
                fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                letterSpacing: 0.6,
                color: '#4527a0',
                textShadow: '0 2px 8px #b388ff22',
                py: 2,
                px: 3,
              }}>{`Leaves Taken in ${monthNames[startMonth]}${startMonth !== endMonth ? ' - ' + monthNames[endMonth] : ''} ${selectedYear}`}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((row, idx) => (
              <TableRow
                key={row.name}
                hover
                selected={selectedUser && selectedUser.name === row.name}
                onClick={() => setSelectedUser(selectedUser && selectedUser.name === row.name ? null : row) }
                sx={{
                  cursor: 'pointer',
                  background: selectedUser && selectedUser.name === row.name
                    ? 'linear-gradient(90deg, #7c4dff 0%, #512da8 100%)'
                    : (idx % 2 === 0 ? 'rgba(245,245,255,0.93)' : '#fff'),
                  color: selectedUser && selectedUser.name === row.name ? '#fff' : '#4527a0',
                  transition: 'background 0.18s, box-shadow 0.18s, color 0.18s',
                  borderRadius: 3,
                  boxShadow: selectedUser && selectedUser.name === row.name ? '0 6px 20px 0 #7c4dff55' : 'none',
                  '&:hover': {
                    background: selectedUser && selectedUser.name === row.name
                      ? 'linear-gradient(90deg, #7c4dff 0%, #512da8 100%)'
                      : 'linear-gradient(90deg, #b39ddb 0%, #7c4dff 100%)',
                    color: '#fff',
                    boxShadow: '0 6px 16px 0 #7c4dff33',
                  },
                }}
              >
                <TableCell sx={{
                  fontWeight: 700,
                  fontSize: 18,
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  color: '#4b2aad',
                  py: 2.2,
                  px: 3,
                  letterSpacing: 0.3,
                  border: 0
                }}>{row.name}</TableCell>
                <TableCell sx={{
                  fontWeight: 700,
                  fontSize: 18,
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  color: '#4b2aad',
                  py: 2.2,
                  px: 3,
                  letterSpacing: 0.3,
                  border: 0
                }}>{row.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={3}>
        <Button
          variant="contained"
          disabled={!selectedUser}
          onClick={() => setDetailsOpen(true)}
          sx={{
            mt: 1,
            fontWeight: 800,
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
            fontSize: 18,
            borderRadius: 8,
            px: 5,
            py: 1.3,
            background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
            color: '#fff',
            boxShadow: '0 4px 18px 0 #b388ff22',
            letterSpacing: 0.3,
            transition: 'background 0.18s, box-shadow 0.18s, transform 0.14s',
            letterSpacing: 0.2,
            transition: 'background 0.2s, box-shadow 0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
              boxShadow: 4,
            }
          }}
        >
          View Details
        </Button>
      </Box>
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="xs"
        PaperProps={{
          style: {
            background: 'rgba(255,255,255,0.98)',
            borderRadius: 28,
            boxShadow: '0 10px 40px 0 rgba(124,77,255,0.18)',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1,
          fontWeight: 900,
          fontSize: 28,
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 0.7,
          textShadow: '0 2px 10px #b388ff33',
          py: 2
        }}>
          User Information
          <Button onClick={() => setDetailsOpen(false)} sx={{ minWidth: 0, p: 0, color: '#7c4dff', fontWeight: 900, fontSize: 28, '&:hover': { color: '#4527a0' } }}>
            <span style={{ fontSize: 28, fontWeight: 900 }}>&times;</span>
          </Button>
        </DialogTitle>
        <DialogContent sx={{ px: 5, py: 3 }}>
  <Box>
    {selectedUser ? (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5,
        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
        color: '#4b2aad',
        fontSize: 19
      }}>
        <Typography sx={{ fontWeight: 900, fontSize: 23, mb: 0.5, letterSpacing: 0.3, color: '#4527a0', textShadow: '0 2px 8px #b388ff22' }}>{selectedUser.name}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 0.5, color: '#6a479c' }}>Location: <span style={{ fontWeight: 700, color: (() => {
          const emp = employees.find(e => e.name === selectedUser.name);
          return emp && emp.location ? '#4527a0' : '#aaa';
        })() }}>{(() => {
          const emp = employees.find(e => e.name === selectedUser.name);
          return emp && emp.location ? emp.location : 'N/A';
        })()}</span></Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 18, mt: 1, color: '#7c4dff' }}>Total Leaves: <span style={{ fontWeight: 900 }}>{selectedUser.total}</span></Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, mt: 2, color: '#7c4dff' }}>Leave Dates ({`${monthNames[startMonth]}${startMonth !== endMonth ? ' - ' + monthNames[endMonth] : ''} ${selectedYear}`})</Typography>
        <Box sx={{ mb: 2, background: 'rgba(124,77,255,0.04)', borderRadius: 3, p: 2, boxShadow: '0 2px 10px 0 #b388ff11' }}>
          {(() => {
            // Find all leave dates for this user in the selected range
            const userLeaves = activeLeaves.filter(l => {
              if (l.employee !== selectedUser.name) return false;
              const dateObj = new Date(l.date);
              const yearMatch = dateObj.getFullYear() === selectedYear;
              const monthMatch = dateObj.getMonth() >= startMonth && dateObj.getMonth() <= endMonth;
              return yearMatch && monthMatch;
            });
            if (userLeaves.length === 0) return <Typography variant="body1" sx={{ fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif', fontWeight: 600, fontSize: 17, color: '#888', letterSpacing: 0.3 }}>None</Typography>;
            // Group by leave type
            const leaveTypeMap = {
              Planned: { color: '#66bb6a', label: '🟩 Planned Leave', dates: [] },
              Emergency: { color: '#ef5350', label: '🟥 Emergency Leave', dates: [] },
              Sick: { color: '#fff176', label: '🟨 Sick Leave', dates: [] },
              HalfDay: { color: '#8bc34a', label: '🟩 Half Day Leave', dates: [] }
            };
            userLeaves.forEach(l => {
              if (leaveTypeMap[l.type]) leaveTypeMap[l.type].dates.push(l.date);
            });
            return Object.entries(leaveTypeMap).map(([type, { color, label, dates }]) => (
              dates.length > 0 && (
                <Box key={type} sx={{ mb: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color, mb: 0.5, fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif', letterSpacing: 0.3, textShadow: '0 1px 6px #b388ff22' }}>{label}:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                    {dates.map(date => (
                      <span key={date} style={{
                        background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)',
                        borderRadius: 14,
                        padding: '6px 16px',
                        fontWeight: 800,
                        fontSize: 17,
                        color: '#7c4dff',
                        letterSpacing: 0.3,
                        fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                        marginRight: 7,
                        boxShadow: '0 1px 8px 0 #b388ff22',
                        textShadow: '0 1px 6px #b388ff22'
                      }}>{format(new Date(date), 'dd MMM, yyyy')}</span>
                    ))}
                  </Box>
                </Box>
              )
            ));
          })()}
        </Box>
      </Box>
    ) : null}
  </Box>
</DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setDetailsOpen(false)}
            variant="outlined"
            sx={{
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
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AnalysisTable;
