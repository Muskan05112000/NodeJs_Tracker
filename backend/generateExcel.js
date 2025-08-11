const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { format, addDays, startOfWeek, isSameDay } = require('date-fns');

// Generate Excel for current week with colored leave codes
async function generateLeaveTrackerExcel({ employees, leaves, weekStart, weekDays }) {
  let weekDayObjs;
  if (Array.isArray(weekDays) && weekDays.length > 0) {
    weekDayObjs = weekDays.map(d => new Date(d));
  } else {
    weekDayObjs = Array.from({ length: 5 }, (_, i) => addDays(new Date(weekStart), i));
  }
  // Strictly filter to only Mon-Fri (1=Mon, 5=Fri)
  weekDayObjs = weekDayObjs.filter(d => {
    const day = d.getDay();
    return day >= 1 && day <= 5;
  });
  const fileName = `LeaveTracker_Week${Math.floor((new Date(weekStart).getDate() - 1) / 7) + 1}.xlsx`;
  const filePath = path.join(__dirname, fileName);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Leave Tracker');

  // Header
  const header = ['Employee Name', ...weekDayObjs.map(d => format(d, 'dd MMM'))];
  sheet.addRow(header);
  sheet.getRow(1).font = { bold: true };

  // Data rows
  employees.forEach(emp => {
    const row = [emp.name];
    weekDayObjs.forEach(day => {
      const leave = leaves.find(l => l.employee === emp.name && isSameDay(new Date(l.date), day));
      let code = '';
      if (leave) {
        if (leave.type === 'Planned') code = 'PL';
        else if (leave.type === 'Emergency') code = 'EL';
        else if (leave.type === 'Sick') code = 'SL';
      }
      row.push(code);
    });
    sheet.addRow(row);
  });

  // Color cells by leave type
  for (let r = 2; r <= employees.length + 1; r++) {
    for (let c = 2; c <= weekDays.length + 1; c++) {
      const cell = sheet.getRow(r).getCell(c);
      if (cell.value === 'PL') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      } else if (cell.value === 'EL') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      } else if (cell.value === 'SL') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
      }
    }
  }

  await workbook.xlsx.writeFile(filePath);
  return { fileName, filePath };
}

module.exports = { generateLeaveTrackerExcel };
