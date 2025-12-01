import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Calendar from "./Calendar";
import LeaveModal from "./LeaveModal";
import { Box, CircularProgress, Button } from "@mui/material";
import { format } from "date-fns";
import PromptDialog from "./PromptDialog";
import AlertDialog from "./AlertDialog";

const userLocation = "Chennai"; // For demo, can be made dynamic

const ApplyLeave = () => {
  const [pendingRevoke, setPendingRevoke] = useState(null);
  // Dialog state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptMsg, setPromptMsg] = useState("");
  const [promptValue, setPromptValue] = useState("");
  const [onPromptOk, setOnPromptOk] = useState(() => () => { });

  // Helper for alerts
  const showAlert = (msg) => { setAlertMsg(msg); setAlertOpen(true); };
  // Helper for prompts
  const showPrompt = (msg, onOk, initial = "") => {
    setPromptMsg(msg);
    setPromptValue(initial);
    setOnPromptOk(() => onOk);
    setPromptOpen(true);
  };

  const { holidays, leaves, addLeave, editLeave, revokeLeave, loading, employees } = useContext(AppContext);
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  // Get leaves for current month
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLeaves = leaves.filter(l => l.date.startsWith(monthStr));

  const handleDateClick = (date, isNational) => {
    // Prevent opening modal for weekends
    const dayObj = new Date(date);
    if (dayObj.getDay() === 0 || dayObj.getDay() === 6) {
      return;
    }
    // Allow modal for national holidays too
    const leavesForDate = leaves.filter(l => l.date === date);
    setEditingLeave(null); // Always open in apply mode for date cell click
    setSelectedDates([date]);
    setLeavesForDate(leavesForDate);
    setModalOpen(true);
  };



  // Add state for leavesForDate
  const [leavesForDate, setLeavesForDate] = useState([]);

  const handleMonthYearChange = (date) => {
    setMonth(date.getMonth());
    setYear(date.getFullYear());
    setSelectedDates([]);
  };

  const handleModalSubmit = async ({ employee, type }) => {
    for (let date of selectedDates) {
      // Check if leave exists
      const existing = leaves.find(l => l.date === date && l.employee === employee);
      if (existing) {
        showAlert('Employee already applied leave. If you want to edit the information select the applied leave in Select Leave dropdown');
        return;
      }
    }
    for (let date of selectedDates) {
      await addLeave({ date, employee, type });
    }
    setModalOpen(false);
    setSelectedDates([]);
    setEditingLeave(null);
    setTimeout(() => { showAlert('Leave Applied Successfully'); }, 100);
  };

  // For demo: only allow Chennai regional holidays
  const regionalLocations = [userLocation];

  if (loading) return <Box ml={30} mt={10}><CircularProgress /></Box>;

  return (
    <>
      <div style={{
        minHeight: 'calc(100vh - 72px)',
        height: 'calc(100vh - 72px)',
        background: 'var(--primary-gradient)',
        padding: 0,
        marginLeft: 'var(--sidebar-width, 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
        boxSizing: 'border-box',
        width: '100%',
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)'
      }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="page-heading fade-in" style={{ background: 'transparent', textAlign: 'center', margin: 0, marginBottom: 12 }}>Apply Leave</div>
        </div>
        <div className="fade-in" style={{ flex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start', margin: 0, padding: 0, background: 'transparent', boxShadow: 'none', borderRadius: 0 }}>
          <Calendar
            className="table"

            month={month}
            year={year}
            holidays={holidays}
            leaves={monthLeaves}
            onDateClick={handleDateClick}
            onLeaveClick={(date, leave) => {
              setEditingLeave(leave);
              setSelectedDates([date]);
              setModalOpen(true);
            }}
            selectedDates={selectedDates}
            regionalLocations={regionalLocations}
            disableNational={true}
            onMonthYearChange={handleMonthYearChange}
          />
        </div>
      </div>
      <LeaveModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedDates([]); setEditingLeave(null); setLeavesForDate([]); }}
        selectedDates={selectedDates}
        editingLeave={editingLeave}
        leavesForDate={leavesForDate}
        onSubmit={handleModalSubmit}
        onEdit={async (leave) => {
          // Always update the leave entry by its _id with new employee/type
          if (leave._id) {
            await editLeave(leave._id, { ...leave, employee: leave.employee, type: leave.type });
            setModalOpen(false);
            setSelectedDates([]);
            setEditingLeave(null);
            setLeavesForDate([]);
            setAlertMsg('Leave details updated successfully');
            setAlertOpen(true);
          } else {
            setAlertMsg('Input information is not available');
            setAlertOpen(true);
          }
        }}
        onRevoke={async ({ employee, type, revocationReason }) => {
          let revoked = false;
          let reason = revocationReason;
          if (!reason) {
            // Store pending revoke info and open prompt
            setPendingRevoke({ employee, type });
            showPrompt('Please provide a reason for revoking this leave:', async (val) => {
              setPromptOpen(false);
              if (!val) return;
              // Get logged-in user info from top-level hook
              let revokedBy = user?.associateId;
              if (employees && user?.associateId) {
                const emp = employees.find(e => String(e.associateId) === String(user.associateId));
                if (emp) revokedBy = emp.name;
              }
              for (let date of selectedDates) {
                const existing = leaves.find(l => l.date === date && l.employee === employee && l.type === type);
                if (existing) {
                  const res = await revokeLeave(existing._id, val, revokedBy);
                  if (res && res.error) {
                    setAlertMsg(res.error);
                    setAlertOpen(true);
                    continue;
                  }
                  revoked = true;
                }
              }
              setModalOpen(false);
              setSelectedDates([]);
              setEditingLeave(null);
              setLeavesForDate([]);
              if (revoked) {
                setAlertMsg('Leave revoked successfully');
                setAlertOpen(true);
              } else {
                setAlertMsg('Input information is not available');
                setAlertOpen(true);
              }
            });
            return;
          }
          // Get logged-in user info from top-level hook
          let revokedBy = user?.associateId;
          if (employees && user?.associateId) {
            const emp = employees.find(e => String(e.associateId) === String(user.associateId));
            if (emp) revokedBy = emp.name;
          }
          for (let date of selectedDates) {
            const existing = leaves.find(l => l.date === date && l.employee === employee && l.type === type);
            if (existing) {
              const res = await revokeLeave(existing._id, reason, revokedBy);
              if (res && res.error) {
                setAlertMsg(res.error);
                setAlertOpen(true);
                continue;
              }
              revoked = true;
            }
          }
          setModalOpen(false);
          setSelectedDates([]);
          setEditingLeave(null);
          setLeavesForDate([]);
          if (revoked) {
            setAlertMsg('Leave revoked successfully');
            setAlertOpen(true);
          } else {
            setAlertMsg('Input information is not available');
            setAlertOpen(true);
          }
        }}
      />
      <PromptDialog
        open={promptOpen}
        title={"Input Required"}
        message={promptMsg}
        value={promptValue}
        onChange={setPromptValue}
        onCancel={() => { setPromptOpen(false); setPromptValue(""); onPromptOk(null); }}
        onOk={() => { setPromptOpen(false); onPromptOk(promptValue); }}
      />
      <AlertDialog
        open={alertOpen}
        message={alertMsg}
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
};

export default ApplyLeave;
