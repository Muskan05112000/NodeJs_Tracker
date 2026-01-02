import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Calendar from "./Calendar";
import LeaveModal from "./LeaveModal";
import { Box, CircularProgress } from "@mui/material";
import PromptDialog from "./PromptDialog";
import AlertDialog from "./AlertDialog";

const userLocation = "Chennai"; // For demo, can be made dynamic

const ApplyLeave = () => {
    // const [pendingRevoke, setPendingRevoke] = useState(null);
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

    const handleDateClick = (date) => {
        // Prevent opening modal for weekends
        const dayObj = new Date(date);
        if (dayObj.getDay() === 0 || dayObj.getDay() === 6) {
            return;
        }
        // Allow modal for national holidays too
        // const leavesForDate = leaves.filter(l => l.date === date); // OLD: Show leaves
        setEditingLeave(null); // Always open in apply mode for date cell click
        setSelectedDates([date]);
        setLeavesForDate([]); // NEW: Force "Apply Leave" mode (hide existing leaves) when clicking empty space
        setModalOpen(true);
    };



    // Add state for leavesForDate
    const [leavesForDate, setLeavesForDate] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleMonthYearChange = (date) => {
        setMonth(date.getMonth());
        setYear(date.getFullYear());
        setSelectedDates([]);
    };

    const handleModalSubmit = async ({ employee, type }) => {
        setIsSubmitting(true);
        try {
            for (let date of selectedDates) {
                // Check if leave exists
                const existing = leaves.find(l => l.date === date && l.employee === employee);
                if (existing) {
                    showAlert('Employee already applied leave. If you want to edit the information select the applied leave in Select Leave dropdown');
                    setIsSubmitting(false); // Reset if error
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
        } catch (error) {
            console.error("Error submitting leave:", error);
            showAlert('Failed to apply leave. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                            // Determine if user should see the leave prepopulated
                            // Only Manager, Lead, or the Owner should see the details prepopulated for editing/viewing.
                            // Others should see a blank form (to apply for themselves).
                            const loggedInEmployee = employees.find(e => String(e.associateId) === String(user?.associateId));
                            const isManagerOrLead = user && (user.role === 'Manager' || user.role === 'Lead');
                            const isOwner = loggedInEmployee && leave.employee === loggedInEmployee.name;

                            if (isManagerOrLead || isOwner) {
                                setEditingLeave(leave);
                            } else {
                                setEditingLeave(null);
                            }

                            // FIX: Must set leavesForDate so the modal knows there are existing leaves (to show Edit/Revoke)
                            const leavesOnThisDate = leaves.filter(l => l.date === date);
                            setLeavesForDate(leavesOnThisDate);

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
                key={selectedDates.join('-') + (editingLeave?._id || 'new')} // Force remount on date/leave change to clear internal state
                open={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedDates([]); setEditingLeave(null); setLeavesForDate([]); }}
                selectedDates={selectedDates}
                editingLeave={editingLeave}
                leavesForDate={leavesForDate}
                onSubmit={handleModalSubmit}
                isSubmitting={isSubmitting}
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
                    let requested = false;
                    let reason = revocationReason;

                    const performRevoke = async (reasonVal) => {
                        // Get logged-in user info from top-level hook
                        let revokedBy = user?.associateId;
                        if (employees && user?.associateId) {
                            const emp = employees.find(e => String(e.associateId) === String(user.associateId));
                            if (emp) revokedBy = emp.name;
                        }

                        for (let date of selectedDates) {
                            const existing = leaves.find(l => l.date === date && l.employee === employee && l.type === type);
                            if (existing) {
                                const res = await revokeLeave(existing._id, reasonVal, revokedBy);
                                if (res && res.error) {
                                    setAlertMsg(res.error);
                                    setAlertOpen(true);
                                    continue;
                                }
                                if (res && res.approvalRequired) {
                                    requested = true;
                                } else {
                                    revoked = true;
                                }
                            }
                        }

                        setModalOpen(false);
                        setSelectedDates([]);
                        setEditingLeave(null);
                        setLeavesForDate([]);

                        if (requested) {
                            setAlertMsg('Revocation requested. Pending Manager approval.');
                            setAlertOpen(true);
                        } else if (revoked) {
                            setAlertMsg('Leave revoked successfully');
                            setAlertOpen(true);
                        } else {
                            // If neither happened, maybe it wasn't found or error alert already shown
                        }
                    };

                    if (!reason) {
                        showPrompt('Please provide a reason for revoking (or requesting to revoke) this leave:', async (val) => {
                            if (!val) return;
                            await performRevoke(val);
                        });
                        return;
                    }

                    await performRevoke(reason);
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
