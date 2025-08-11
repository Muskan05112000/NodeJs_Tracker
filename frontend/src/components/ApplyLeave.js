import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import Calendar from "./Calendar";
import LeaveModal from "./LeaveModal";
import { Box, CircularProgress, Button } from "@mui/material";
import { format } from "date-fns";

const userLocation = "Chennai"; // For demo, can be made dynamic

const ApplyLeave = () => {
  const { holidays, leaves, addLeave, editLeave, revokeLeave, loading } = useContext(AppContext);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  // Get leaves for current month
  const monthStr = `${year}-${String(month+1).padStart(2, '0')}`;
  const monthLeaves = leaves.filter(l => l.date.startsWith(monthStr));

  const handleDateClick = (date, isNational) => {
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
        alert('Employee already applied leave. If you want to edit the information select the applied leave in Select Leave dropdown');
        return;
      }
    }
    for (let date of selectedDates) {
      await addLeave({ date, employee, type });
    }
    setModalOpen(false);
    setSelectedDates([]);
    setEditingLeave(null);
    setTimeout(() => { alert('Leave Applied Successfully'); }, 100);
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
            alert('Leave details updated successfully');
          } else {
            alert('Input information is not available');
          }
        }}
        onRevoke={async ({ employee, type }) => {
          let revoked = false;
          for (let date of selectedDates) {
            const existing = leaves.find(l => l.date === date && l.employee === employee && l.type === type);
            if (existing) {
              await revokeLeave(existing._id);
              revoked = true;
            }
          }
          setModalOpen(false);
          setSelectedDates([]);
          setEditingLeave(null);
          setLeavesForDate([]);
          if (revoked) {
            alert('Leave revoked successfully');
          } else {
            alert('Input information is not available');
          }
        }}
      />
    </>
  );
};

export default ApplyLeave;
