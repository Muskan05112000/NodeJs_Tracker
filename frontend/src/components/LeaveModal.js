import React, { useState, useContext } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, InputLabel, FormControl, Box, Snackbar, Alert } from "@mui/material";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const leaveTypes = [
  { value: "None", label: "None" },
  { value: "Planned", label: "Planned Leave" },
  { value: "Emergency", label: "Emergency Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "HalfDay", label: "Half Day Leave" }
];

function LeaveModal({ open, onClose, selectedDates, editingLeave, onSubmit, onRevoke, onEdit, leavesForDate = [], isSubmitting }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const { employees, deleteLeave } = useContext(AppContext);
  const { user } = useAuth();
  // Find the logged-in employee by associateId
  const loggedInEmployee = employees.find(emp => String(emp.associateId) === String(user?.associateId));
  // If only one leave for the date, prefill. Otherwise, let user select.
  // Track which leave is selected for editing if multiple
  // Track which leave is selected for editing if multiple
  const [selectedLeaveId, setSelectedLeaveId] = useState(editingLeave?._id || "none");
  const [employee, setEmployee] = useState(editingLeave?.employee || "none");
  const [type, setType] = useState(editingLeave?.type || "None");

  // When selectedLeaveId changes, update fields
  React.useEffect(() => {
    if (selectedLeaveId && selectedLeaveId !== "none") {
      const leave = leavesForDate.find(l => l._id === selectedLeaveId);
      if (leave) {
        setEmployee(leave.employee);
        setType(leave.type);
      }
    }
  }, [selectedLeaveId, leavesForDate]);

  // When leavesForDate or editingLeave changes (modal opens)
  React.useEffect(() => {
    if (editingLeave?._id) {
      setSelectedLeaveId(editingLeave._id);
      setEmployee(editingLeave.employee);
      setType(editingLeave.type);
    } else {
      // If no editingLeave (clicked on cell), always clear selection
      // regardless of how many leaves exist
      setSelectedLeaveId("none");
      setEmployee("none");
      setType("None");
    }
  }, [leavesForDate, editingLeave]);

  const handleSubmit = () => {
    if (!employee || employee === "none" || type === "None") return;
    onSubmit({ employee, type });
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{
      style: {
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 8px 32px 0 rgba(124,77,255,0.18)',
        border: '2px solid #ede7f6',
        padding: 0
      }
    }}>
      <DialogTitle style={{
        background: 'linear-gradient(90deg, #b39ddb 0%, #ede7f6 100%)',
        color: '#5e35b1',
        fontWeight: 800,
        fontSize: 24,
        letterSpacing: 0.5,
        textAlign: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 10
      }}>{leavesForDate && leavesForDate.length > 0 ? "Edit Leave" : "Apply Leave"}</DialogTitle>
      <DialogContent style={{ padding: 24, minWidth: 340 }}>
        <Box sx={{ minWidth: 250, mt: 1 }}>
          {/* Dropdown to select which leave to edit if multiple */}
          {leavesForDate.length > 1 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Leave</InputLabel>
              <Select
                value={selectedLeaveId}
                label="Select Leave"
                onChange={e => {
                  setSelectedLeaveId(e.target.value);
                  if (e.target.value === "none") {
                    setEmployee("none");
                    setType("None");
                  }
                }}
              >
                <MenuItem value="none">None</MenuItem>
                {leavesForDate.map(l => (
                  <MenuItem key={l._id} value={l._id}>{l.employee} ({l.type})</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Employee Name</InputLabel>
            <Select value={employee} label="Employee Name" onChange={e => {
              const newEmployee = e.target.value;
              // If only one leave exists for this date and user selects the employee, autofill type and set selectedLeaveId
              if (leavesForDate.length === 1 && leavesForDate[0].employee === newEmployee) {
                setEmployee(newEmployee);
                setType(leavesForDate[0].type);
                setSelectedLeaveId(leavesForDate[0]._id);
                return;
              }
              // Only block for new leave, not for edit/revoke
              if (
                (!selectedLeaveId || selectedLeaveId === "none") &&
                leavesForDate.some(l => l.employee === newEmployee) &&
                leavesForDate.length === 0 // Only block if truly adding a new leave, not editing/revoking
              ) {
                setAlertMsg('Employee already applied leave. If you want to edit the information select the applied leave in Select Leave dropdown');
                setAlertOpen(true);
                return;
              }
              setEmployee(newEmployee);
              setType("None");
              setSelectedLeaveId("none");
            }}>
              <MenuItem value="none">None</MenuItem>
              {employees.map(emp => {
                // Enable all employees for Manager/Lead, else only self
                const isManagerOrLead = user && (user.role === 'Manager' || user.role === 'Lead');
                const isSelf = loggedInEmployee && emp.name === loggedInEmployee.name;
                return (
                  <MenuItem
                    key={emp._id || emp.name}
                    value={emp.name}
                    disabled={!(isManagerOrLead || isSelf)}
                  >
                    {emp.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Type of Leave</InputLabel>
            <Select value={type} label="Type of Leave" onChange={e => setType(e.target.value)}>
              {leaveTypes.map(opt => {
                let disablePlanned = false;
                // Never disable for Manager or Lead
                const isManagerOrLead = user && (user.role === 'Manager' || user.role === 'Lead');
                if (opt.value === 'Planned') {
                  if (!isManagerOrLead) {
                    if (selectedDates && selectedDates.length > 0) {
                      const today = new Date();
                      const currentMonth = today.getMonth();
                      const currentYear = today.getFullYear();
                      // If any selected date is in a previous month/year, disable Planned Leave
                      const isPreviousMonthSelected = selectedDates.some(dateStr => {
                        const dateObj = new Date(dateStr);
                        return (
                          dateObj.getFullYear() < currentYear ||
                          (dateObj.getFullYear() === currentYear && dateObj.getMonth() < currentMonth)
                        );
                      });
                      if (isPreviousMonthSelected) {
                        disablePlanned = true;
                      } else {
                        // If at least one selected date is in the current month and today > 7, disable Planned Leave
                        const isCurrentMonthSelected = selectedDates.some(dateStr => {
                          const dateObj = new Date(dateStr);
                          return (
                            dateObj.getMonth() === currentMonth &&
                            dateObj.getFullYear() === currentYear
                          );
                        });
                        if (isCurrentMonthSelected && today.getDate() > 7) {
                          disablePlanned = true;
                        }
                      }
                    }
                  }
                }
                return (
                  <MenuItem key={opt.value} value={opt.value} disabled={disablePlanned}>{opt.label}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end', gap: 16, padding: '16px 24px 24px 24px' }}>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!employee || employee === "none" || type === "None" || isSubmitting || (selectedLeaveId && selectedLeaveId !== "none")}
          sx={{
            borderRadius: 8,
            fontWeight: 800,
            px: 4,
            background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
            boxShadow: 3,
            color: '#fff',
            letterSpacing: 0.5,
            textTransform: 'none',
            fontSize: 17,
            transition: 'background 0.18s, box-shadow 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #9575cd 0%, #7c4dff 100%)',
              boxShadow: '0 2px 12px 0 rgba(124,77,255,0.18)'
            },
            '&:disabled': { background: '#ede7f6', color: '#b39ddb' }
          }}
        >
          {isSubmitting ? "Applying..." : "Apply"}
        </Button>
        {leavesForDate && leavesForDate.length > 0 && (
          <>
            <Button
              onClick={async () => {
                if (onEdit && employee && type && selectedLeaveId !== "none") {
                  const leaveToEdit = leavesForDate.find(l => l._id === selectedLeaveId);
                  if (leaveToEdit && leaveToEdit._id) {
                    onEdit({ ...leaveToEdit, employee, type });
                    onClose();
                  }
                }
              }}
              variant="contained"
              color="primary"
              disabled={!employee || !type || selectedLeaveId === "none" || (() => {
                // Allow Lead to always edit
                if (user && user.role === 'Lead') return false;

                const leave = leavesForDate.find(l => l._id === selectedLeaveId);
                if (!leave) return false;

                const leaveDate = new Date(leave.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                // Disable edit for past dates
                return leaveDate < today;
              })()}
              sx={{
                borderRadius: 8,
                fontWeight: 800,
                px: 4,
                background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
                boxShadow: 3,
                color: '#fff',
                letterSpacing: 0.5,
                textTransform: 'none',
                fontSize: 17,
                transition: 'background 0.18s, box-shadow 0.18s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #9575cd 0%, #7c4dff 100%)',
                  boxShadow: '0 2px 12px 0 rgba(124,77,255,0.18)'
                },
                '&:disabled': { background: '#ede7f6', color: '#b39ddb' }
              }}
            >
              Edit
            </Button>
            {/* DELETE BUTTON - Only for Leads */}
            {user && user.role === 'Lead' && (
              <Button
                onClick={() => setDeleteDialogOpen(true)}
                variant="contained"
                color="error"
                disabled={selectedLeaveId === "none"}
                sx={{
                  borderRadius: 8,
                  fontWeight: 900,
                  px: 3,
                  py: 1,
                  fontSize: 16,
                  background: '#d32f2f',
                  color: '#fff',
                  letterSpacing: 0.8,
                  boxShadow: '0 4px 18px 0 rgba(211, 47, 47, 0.25)',
                  textTransform: 'uppercase',
                  border: '2px solid #b71c1c',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  '&:hover': {
                    background: '#c62828',
                    boxShadow: '0 6px 24px 0 rgba(198, 40, 40, 0.3)',
                  }
                }}
              >
                Delete
              </Button>
            )}

            {/* REVOKE BUTTON - For Everyone (including Lead) */}
            <Button
              onClick={async () => {
                if (employee && type && selectedLeaveId !== "none") {
                  if (onRevoke) {
                    await onRevoke({ employee, type });
                    onClose();
                  }
                }
              }}
              variant="contained"
              color="error"
              disabled={
                !employee ||
                !type ||
                selectedLeaveId === "none" ||
                (() => {
                  const leave = leavesForDate.find(l => l._id === selectedLeaveId);
                  if (!leave) return true;

                  // If already revoked, "Delete" is the only option (handled by button above for Leads)
                  // So disable "Revoke" button if status is Revoked
                  if (leave.status === 'Revoked') return true;

                  // Allow Lead to always Revoke (if active)
                  if (user && user.role === 'Lead') return false;

                  // For others: strictly only allow revoking OWN leaves
                  if (loggedInEmployee && leave.employee !== loggedInEmployee.name) return true;

                  return false;
                })()
              }
              sx={{
                borderRadius: 8,
                fontWeight: 900,
                px: 3,
                py: 1,
                fontSize: 16,
                background: 'linear-gradient(90deg, #ff5252 0%, #ff1744 100%)',
                color: '#fff',
                letterSpacing: 0.8,
                boxShadow: '0 4px 18px 0 rgba(255,82,82,0.18)',
                textTransform: 'uppercase',
                border: '2px solid #ff5252',
                transition: 'background 0.18s, box-shadow 0.18s, color 0.18s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #ff1744 0%, #ff5252 100%)',
                  color: '#fff',
                  boxShadow: '0 6px 24px 0 rgba(255,23,68,0.22)',
                  borderColor: '#ff1744',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#888',
                  borderColor: '#e0e0e0',
                  boxShadow: 'none',
                  opacity: 1,
                  cursor: 'not-allowed',
                }
              }}
            >
              Revoke
            </Button>
          </>
        )}
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          sx={{
            borderRadius: 8,
            fontWeight: 800,
            px: 4,
            color: '#7c4dff',
            border: '2px solid #b39ddb',
            background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
            letterSpacing: 0.5,
            textTransform: 'none',
            fontSize: 17,
            transition: 'background 0.18s, border-color 0.18s, color 0.18s',
            '&:hover': {
              background: '#ede7f6',
              borderColor: '#7c4dff',
              color: '#5e35b1'
            }
          }}
        >
          Cancel
        </Button>
      </DialogActions>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 900, color: '#d32f2f', fontSize: 22 }}>Permanently Delete Leave?</DialogTitle>
        <DialogContent>
          <Box sx={{ fontSize: 17, fontWeight: 600, color: '#333', mb: 2 }}>
            Are you sure you want to <span style={{ color: '#d32f2f', fontWeight: 900 }}>permanently delete</span> this leave? This action cannot be undone.
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary" variant="outlined" sx={{ fontWeight: 800, px: 3, borderRadius: 8 }}>Cancel</Button>
          <Button onClick={async () => {
            const leaveToDelete = leavesForDate.find(l => l._id === selectedLeaveId);
            if (leaveToDelete) {
              await deleteLeave(leaveToDelete._id);
              setDeleteDialogOpen(false);
              onClose();
            }
          }} color="error" variant="contained" sx={{ fontWeight: 900, px: 3, borderRadius: 8 }}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setAlertOpen(false)} severity="warning" sx={{ width: '100%', fontWeight: 600 }}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default LeaveModal;
