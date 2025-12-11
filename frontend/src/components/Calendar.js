import React, { useState, useEffect, useContext } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton, Typography, Box, Dialog } from "@mui/material";
import LeaveWrapped from "./LeaveWrapped";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({
  month,
  year,
  holidays,
  leaves,
  onDateClick,
  selectedDates,
  regionalLocations,
  disableNational,
  onMonthYearChange
}) {
  const { user } = useAuth();
  const [wrappedOpen, setWrappedOpen] = useState(false);
  const [teaserOpen, setTeaserOpen] = useState(false);
  const currentMonth = new Date(year, month);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(endOfMonth(monthStart));

  // Auto-Popup Logic (Dec 10 - Jan 10) AND Global Trigger Check
  useEffect(() => {
    const checkPopup = async () => {
      // 1. Check Global Trigger (Admin Override)
      try {
        const res = await fetch('http://localhost:4000/api/config/wrapped-trigger');
        const data = await res.json();
        if (data.value) {
          const serverTriggerTime = parseInt(data.value);
          const lastSeenTrigger = parseInt(localStorage.getItem('wrappedTriggerSeenAt') || '0');

          if (serverTriggerTime > lastSeenTrigger) {
            console.log("Wrapped: Global Admin Trigger Detected!");
            setTeaserOpen(true);
            localStorage.setItem('wrappedTriggerSeenAt', serverTriggerTime.toString());
            localStorage.removeItem('wrappedLastShown'); // Reset cooldown
            return; // Stop here, priority to Admin
          }
        }
      } catch (err) {
        console.error("Failed to check global trigger", err);
      }

      // 2. Normal Date Window Logic
      const today = new Date();
      const m = today.getMonth(); // 0-based: Dec=11, Jan=0
      const d = today.getDate();
      const isWindow = (m === 11 && d >= 10) || (m === 0 && d <= 10);

      if (isWindow) {
        const lastShown = localStorage.getItem('wrappedLastShown');
        const now = Date.now();
        const COOLDOWN = 5 * 60 * 60 * 1000;

        if (!lastShown || now - parseInt(lastShown) > COOLDOWN) {
          setTeaserOpen(true);
          localStorage.setItem('wrappedLastShown', now.toString());
        }
      }
    };

    checkPopup();
  }, []);

  // Always show 6 rows (6*7=42 days)
  // Build a 2D array: rows[week][col] for per-row height logic
  let rows = [];
  let day = startDate;
  for (let week = 0; week < 6; week++) {
    let weekCells = [];
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "yyyy-MM-dd");
      const holiday = holidays.find(h => h.date === formattedDate);
      const isNational = holiday && holiday.national;
      // Regional: not national, has locations array, and at least one location
      const isRegional = holiday && !isNational && Array.isArray(holiday.locations) && holiday.locations.length > 0;
      const dayLeaves = leaves.filter(l => l.date === formattedDate);
      const isSelected = selectedDates.includes(formattedDate);
      const isInCurrentMonth = day.getMonth() === month;
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      weekCells.push({
        key: formattedDate,
        isSelected,
        isNational,
        isRegional,
        holiday,
        dayLeaves,
        dayObj: new Date(day),
        isInCurrentMonth,
        isWeekend
      });
      day = addDays(day, 1);
    }
    rows.push(weekCells);
  }

  // Render cells as perfect squares, with internal scroll if overflow
  const gridCells = [];
  for (let week = 0; week < 6; week++) {
    for (let col = 0; col < 7; col++) {
      const cell = rows[week][col];
      gridCells.push(
        cell.isInCurrentMonth ? (
          <div
            key={cell.key}
            className={`calendar - cell${cell.isSelected ? ' selected' : ''}${cell.isNational ? ' national' : ''}${cell.isWeekend ? ' weekend' : ''} `}
            style={{
              background: cell.isWeekend
                ? 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)' // Soft purple gradient for weekends
                : cell.isNational
                  ? 'rgba(255, 241, 118, 0.72)'
                  : cell.isRegional
                    ? 'rgba(100, 181, 246, 0.68)'
                    : 'rgba(255,255,255,0.38)',
              border: cell.isSelected ? '2.5px solid #7c4dff' : '1.5px solid #c7b6fa',
              boxShadow: cell.isSelected ? '0 0 16px 2px #b39ddb, 0 2px 12px 0 rgba(124,77,255,0.10)' : '0 2px 10px 0 rgba(124,77,255,0.08)',
              backdropFilter: 'blur(8px)',
              opacity: cell.isWeekend ? 0.5 : cell.isNational ? 0.7 : 1,
              cursor: cell.isWeekend ? 'not-allowed' : 'pointer',
              borderRadius: 12,
              pointerEvents: cell.isWeekend ? 'none' : 'auto', // disables hover for weekends
              fontFamily: 'Roboto, Inter, Arial, sans-serif',
              padding: 9,
              display: 'flex',
              flexDirection: 'column',
              alignItems: cell.isRegional ? 'center' : 'flex-start',
              justifyContent: cell.isRegional ? 'center' : 'flex-start',
              minWidth: 0,
              minHeight: 0,
              transition: 'border 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), background 0.18s',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
              aspectRatio: '1/1',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxHeight: '100%',
              position: 'relative',
            }}
            onMouseEnter={cell.isWeekend ? undefined : (e => {
              e.currentTarget.style.boxShadow = '0 0 20px 4px #b388ff, 0 4px 24px 0 rgba(124,77,255,0.17)';
              e.currentTarget.style.background = cell.isNational ? 'rgba(255, 241, 118, 0.82)' : cell.isRegional ? 'rgba(100, 181, 246, 0.78)' : 'rgba(140, 97, 255, 0.10)';
            })}
            onMouseLeave={cell.isWeekend ? undefined : (e => {
              e.currentTarget.style.boxShadow = cell.isSelected ? '0 0 16px 2px #b39ddb, 0 2px 12px 0 rgba(124,77,255,0.10)' : '0 2px 10px 0 rgba(124,77,255,0.08)';
              e.currentTarget.style.background = cell.isNational ? 'rgba(255, 241, 118, 0.72)' : cell.isRegional ? 'rgba(100, 181, 246, 0.68)' : 'rgba(255,255,255,0.38)';
            })}
            onClick={() => {
              if (!cell.isWeekend && onDateClick) {
                onDateClick(cell.key, cell.isNational);
              }
            }}
          >
            <span style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 2,
              alignSelf: 'flex-end',
              textAlign: 'right',
              width: '100%',
              display: 'block',
              paddingRight: 2
            }}>{format(cell.dayObj, "d")}</span>
            {/* Regional Holiday block (left-aligned, stacked, small, white) */}
            {cell.isRegional && cell.holiday && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  width: '100%',
                  marginBottom: 4,
                  marginTop: 2,
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  textAlign: 'left',
                  letterSpacing: 0.2,
                  padding: '2px 10px',
                  borderRadius: 14,
                  background: 'linear-gradient(90deg, #64b5f6 0%, #9575cd 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 8px 0 rgba(100,181,246,0.10)',
                  transition: 'box-shadow 0.15s, background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px 2px #9575cd33';
                  e.currentTarget.style.background = 'linear-gradient(90deg, #9575cd 0%, #64b5f6 100%)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(100,181,246,0.10)';
                  e.currentTarget.style.background = 'linear-gradient(90deg, #64b5f6 0%, #9575cd 100%)';
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 0.3, textShadow: '0 1px 2px #0002' }}>🌐 Regional Holiday</span>
                <span style={{ fontWeight: 700, fontSize: 11 }}>{cell.holiday.occasion}</span>
                <span style={{ fontWeight: 400, fontSize: 10, opacity: 0.92 }}>{Array.isArray(cell.holiday.locations) ? cell.holiday.locations.join(', ') : cell.holiday.locations}</span>
              </div>
            )}
            {/* National Holiday (smaller, left-aligned) */}
            {cell.isNational && cell.holiday && (
              <span
                style={{
                  display: 'inline-block',
                  fontWeight: 800,
                  color: '#fff',
                  background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
                  borderRadius: 14,
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  fontSize: 11,
                  lineHeight: 1.3,
                  marginBottom: 2,
                  padding: '3px 10px',
                  boxShadow: '0 2px 8px 0 rgba(255,193,7,0.11)',
                  letterSpacing: 0.2,
                  textShadow: '0 1px 2px #0001',
                  transition: 'box-shadow 0.15s, background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px 2px #ffb34755';
                  e.currentTarget.style.background = 'linear-gradient(90deg, #ffcc33 0%, #ffb347 100%)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(255,193,7,0.11)';
                  e.currentTarget.style.background = 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)';
                }}
              >
                🏵 National Holiday<br /><span style={{ fontWeight: 700 }}>{cell.holiday.occasion}</span>
              </span>
            )}
            {/* Leave entries (appear below holiday info, with spacing) */}
            {cell.dayLeaves.map((leave, idx) => (
              <span
                key={idx}
                style={{
                  marginTop: 5,
                  marginBottom: 2,
                  background:
                    leave.status === 'Revoked'
                      ? 'linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 100%)'
                      : leave.type === 'HalfDay'
                        ? '#bfcf87'
                        : leave.type === 'Planned'
                          ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                          : leave.type === 'Emergency'
                            ? 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)'
                            : 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
                  color: leave.status === 'Revoked' ? '#888' : leave.type === 'Emergency' ? '#fff' : '#222',
                  borderRadius: 16,
                  padding: '3px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  display: 'inline-block',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  cursor: leave.status === 'Revoked' ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 10px 0 rgba(60,60,60,0.10)',
                  letterSpacing: 0.2,
                  transition: 'box-shadow 0.18s, transform 0.18s',
                  opacity: leave.status === 'Revoked' ? 0.6 : 1,
                  textDecoration: leave.status === 'Revoked' ? 'line-through' : 'none',
                  position: 'relative',
                }}
                title={leave.status === 'Revoked' ? `Revoked by: ${leave.revokedBy || 'N/A'} \nRevoked at: ${leave.revokedAt ? new Date(leave.revokedAt).toLocaleString() : 'N/A'} \nReason: ${leave.revocationReason || 'N/A'} ` : ''}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px 2px rgba(124,77,255,0.13)';
                  e.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 10px 0 rgba(60,60,60,0.10)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={e => {
                  if (leave.status === 'Revoked') return;
                  e.stopPropagation();
                  if (typeof onLeaveClick === 'function') {
                    onLeaveClick(cell.key, leave);
                  }
                }}
              >
                {leave.employee} - {leave.type}
                {leave.status === 'Revoked' && (
                  <span style={{
                    background: '#d32f2f',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 900,
                    marginLeft: 8,
                    padding: '2px 7px',
                    letterSpacing: 0.7,
                    verticalAlign: 'middle',
                    display: 'inline-block',
                  }}>
                    Revoked
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div key={cell.key} style={{ background: 'transparent', border: 'none', width: '100%', height: '100%', aspectRatio: '1/1', minHeight: 0, minWidth: 0, boxSizing: 'border-box', pointerEvents: 'none' }} />
        )
      );
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        background: 'transparent',
        boxSizing: 'border-box',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 18,
        marginTop: 0,
      }}>
        <IconButton onClick={() => onMonthYearChange(subMonths(currentMonth, 1))}><ArrowBackIosNewIcon /></IconButton>
        <Typography variant="h6" sx={{ mx: 2, fontFamily: 'Roboto, Inter, Arial, sans-serif', fontWeight: 700, fontSize: 24 }}>{format(currentMonth, "MMMM yyyy")}</Typography>
        <IconButton onClick={() => onMonthYearChange(addMonths(currentMonth, 1))}><ArrowForwardIosIcon /></IconButton>

        {/* ADMIN TRIGGER BUTTON (Lead Only) */}
        {user && user.role === 'Lead' && (
          <Box sx={{ position: 'absolute', right: 20, opacity: 0.8 }} title="Admin: Trigger Wrapped for ALL Users">
            <IconButton onClick={async () => {
              if (window.confirm("GLOBAL TRIGGER: This will popup the 'Wrapped' letter for EVERY user on their next refresh. Are you sure?")) {
                try {
                  await fetch('http://localhost:4000/api/config/trigger-wrapped', { method: 'POST' });
                  alert("Trigger sent! Users will see the popup on next reload.");
                } catch (e) {
                  alert("Failed to send trigger.");
                }
              }
            }} size="small" sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
              🔄
            </IconButton>
          </Box>
        )}
      </div>

      {/* WRAPPED MAIN COMPONENT */}
      <LeaveWrapped open={wrappedOpen} onClose={() => setWrappedOpen(false)} />

      {/* TEASER POPUP - ENVELOPE THEME */}
      <Dialog
        open={teaserOpen}
        maxWidth="xs"
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <Box sx={{
          position: 'relative',
          bgcolor: '#fdfbf7', // Cream paper color
          p: 4,
          borderRadius: 2,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          textAlign: 'center',
          transform: 'rotate(-2deg)', // Slight tilt like a tossed letter
          border: '1px solid #e0e0e0',
          backgroundImage: 'linear-gradient(#fdfbf7 2px, transparent 2px), linear-gradient(90deg, #fdfbf7 2px, transparent 2px), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}>
          {/* Stamps/Postmarks decoration */}
          <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.7, transform: 'rotate(15deg)' }}>
            <Box sx={{ width: 60, height: 60, border: '3px double #d32f2f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f', fontWeight: 'bold', fontSize: '0.7rem' }}>
              URGENT
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', top: 10, left: 10, opacity: 0.6, transform: 'rotate(-10deg)', border: '2px solid #1a237e', padding: '2px 8px', color: '#1a237e', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: 2 }}>
            AIR MAIL
          </Box>

          {/* Icon */}
          <Box sx={{ fontSize: '4rem', mb: 2, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
            ✉️
          </Box>

          {/* Letter Content */}
          <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#2c3e50', mb: 1 }}>
            A Letter for You
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Merriweather, serif', color: '#546e7a', mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
            "We've collected some fond memories and stats from your journey in 2025. Attached herewith is your personalized summary."
          </Typography>

          {/* Attachment / Action */}
          <Box
            onClick={() => { setTeaserOpen(false); setWrappedOpen(true); }}
            sx={{
              cursor: 'pointer',
              bgcolor: '#e0e0e0',
              p: 2,
              borderRadius: 1,
              border: '1px dashed #9e9e9e',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#d7ccc8', transform: 'scale(1.02)' }
            }}
          >
            <Box sx={{ fontSize: '2rem' }}>📎</Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3e2723' }}>
                Leave_Wrapped_2025.pdf
              </Typography>
              <Typography variant="caption" sx={{ color: '#5d4037' }}>
                1.2 MB • Click to Open
              </Typography>
            </Box>
          </Box>

          {/* Wax Seal Button (Alternative or Decorative) */}
          <Box sx={{ mt: 3 }}>
            <Box
              onClick={() => { setTeaserOpen(false); setWrappedOpen(true); }}
              sx={{
                display: 'inline-block',
                cursor: 'pointer',
                bgcolor: '#b71c1c',
                color: 'white',
                width: 50,
                height: 50,
                borderRadius: '50%',
                lineHeight: '50px',
                boxShadow: '0 4px 10px rgba(183, 28, 28, 0.5), inset 0 2px 5px rgba(255,255,255,0.3)',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                border: '4px solid #c62828'
              }}
            >
              OPEN
            </Box>
          </Box>
        </Box>
      </Dialog>

      <div style={{ width: '100%', padding: 0, margin: 0, background: 'transparent' }}>
        <div
          className="calendar-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: 'auto repeat(6, 1fr)', // 1 for header, 6 for weeks
            gap: 12,
            width: '100%',
            height: 'auto',
            background: 'var(--primary-gradient)',
            borderRadius: 0,
            boxShadow: 'none',
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
          }}
        >
          {/* Render weekday headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 16,
                fontFamily: 'Roboto, Inter, Arial, sans-serif',
                padding: 0,
                margin: 0,
                background: 'transparent',
                borderRadius: 6,
                minHeight: 0,
                minWidth: 0,
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'auto',
                width: 'auto',
                boxSizing: 'border-box',
                overflow: 'hidden',
                aspectRatio: '1/1',
              }}
            >
              {day}
            </div>
          ))}
          {/* Render all 42 date cells */}
          {gridCells}
        </div>
      </div>
    </div >
  );

}

export default Calendar;
