import React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton, Typography } from "@mui/material";

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
  const currentMonth = new Date(year, month);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(endOfMonth(monthStart));

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
      weekCells.push({
        key: formattedDate,
        isSelected,
        isNational,
        isRegional,
        holiday,
        dayLeaves,
        dayObj: new Date(day),
        isInCurrentMonth
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
            className={`calendar-cell${cell.isSelected ? ' selected' : ''}${cell.isNational ? ' national' : ''}`}
            style={{
              background: cell.isNational ? 'rgba(255, 241, 118, 0.72)' : cell.isRegional ? 'rgba(100, 181, 246, 0.68)' : 'rgba(255,255,255,0.38)',
              border: cell.isSelected ? '2.5px solid #7c4dff' : '1.5px solid #c7b6fa',
              boxShadow: cell.isSelected ? '0 0 16px 2px #b39ddb, 0 2px 12px 0 rgba(124,77,255,0.10)' : '0 2px 10px 0 rgba(124,77,255,0.08)',
              backdropFilter: 'blur(8px)',
              opacity: cell.isNational ? 0.7 : 1,
              cursor: 'pointer',
              borderRadius: 12,
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
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 20px 4px #b388ff, 0 4px 24px 0 rgba(124,77,255,0.17)';
              e.currentTarget.style.background = cell.isNational ? 'rgba(255, 241, 118, 0.82)' : cell.isRegional ? 'rgba(100, 181, 246, 0.78)' : 'rgba(140, 97, 255, 0.10)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = cell.isSelected ? '0 0 16px 2px #b39ddb, 0 2px 12px 0 rgba(124,77,255,0.10)' : '0 2px 10px 0 rgba(124,77,255,0.08)';
              e.currentTarget.style.background = cell.isNational ? 'rgba(255, 241, 118, 0.72)' : cell.isRegional ? 'rgba(100, 181, 246, 0.68)' : 'rgba(255,255,255,0.38)';
            }}
            onClick={e => {
              // Only open modal if clicking on blank space (not a leave entry)
              if (e.target === e.currentTarget) {
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
                🏵 National Holiday<br/><span style={{fontWeight:700}}>{cell.holiday.occasion}</span>
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
                    leave.type === 'Planned'
                      ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                      : leave.type === 'Emergency'
                      ? 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)'
                      : 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
                  color: leave.type === 'Emergency' ? '#fff' : '#222',
                  borderRadius: 16,
                  padding: '3px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                  display: 'inline-block',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px 0 rgba(60,60,60,0.10)',
                  letterSpacing: 0.2,
                  transition: 'box-shadow 0.18s, transform 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px 2px rgba(124,77,255,0.13)';
                  e.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 10px 0 rgba(60,60,60,0.10)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={e => {
                  e.stopPropagation();
                  if (typeof onLeaveClick === 'function') {
                    onLeaveClick(cell.key, leave);
                  }
                }}
              >
                <span style={{fontWeight:800, fontSize:13}}>{leave.employee}</span>
                <span style={{fontWeight:500, fontSize:12, opacity:0.85}}> ({leave.type})</span>
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
      </div>
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
    </div>
  );

}

export default Calendar;
