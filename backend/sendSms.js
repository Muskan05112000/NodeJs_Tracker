const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Helper to generate Excel file for weekly leave
function generateWeeklyLeaveExcel({ employees, leaves, weekStart }) {
  const weekDays = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 5; i++) {
    weekDays.push(new Date(start.getTime() + i * 86400000));
  }
  const header = ['Employee Name', ...weekDays.map(d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))];
  const data = employees.map(emp => {
    const row = [emp.name];
    weekDays.forEach(day => {
      const leave = leaves.find(l => l.employee === emp.name && new Date(l.date).toDateString() === day.toDateString());
      let code = '';
      if (leave) {
        if (leave.type === 'Planned') code = 'PL';
        else if (leave.type === 'Emergency') code = 'EL';
        else if (leave.type === 'Sick') code = 'SL';
      }
      row.push(code);
    });
    return row;
  });
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  // Color cells by leave type
  for (let r = 2; r <= data.length + 1; r++) {
    for (let c = 2; c <= weekDays.length + 1; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: r - 1, c: c - 1 });
      const code = ws[cellRef] && ws[cellRef].v;
      if (code === 'PL') ws[cellRef].s = { fill: { fgColor: { rgb: 'C6EFCE' } } };
      if (code === 'EL') ws[cellRef].s = { fill: { fgColor: { rgb: 'FFC7CE' } } };
      if (code === 'SL') ws[cellRef].s = { fill: { fgColor: { rgb: 'FFFACD' } } };
    }
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leave Tracker');
  const filePath = path.join(__dirname, 'leave-tracker.xlsx');
  XLSX.writeFile(wb, filePath);
  return filePath;
}

// WhatsApp client singleton
let whatsappClient;
let isReady = false;
function getWhatsappClient() {
  if (!whatsappClient) {
    whatsappClient = new Client({ authStrategy: new LocalAuth() });
    whatsappClient.on('qr', qr => {
      console.log('QR event fired!');
      qrcode.generate(qr, { small: true });
    });
    whatsappClient.on('ready', () => {
      isReady = true;
      console.log('WhatsApp client is ready!');
    });
    whatsappClient.on('authenticated', () => {
      console.log('WhatsApp client authenticated!');
    });
    whatsappClient.on('auth_failure', msg => {
      console.error('AUTH FAILURE', msg);
    });
    whatsappClient.on('disconnected', reason => {
      isReady = false;
      console.log('WhatsApp client disconnected:', reason);
    });
    whatsappClient.initialize();
  }
  return whatsappClient;
}

async function sendWeeklyLeaveSMS({ phone, employees, leaves, weekStart }) {
  const client = getWhatsappClient();
  if (!isReady) throw new Error('WhatsApp client not ready. Scan QR in backend terminal.');
  const filePath = generateWeeklyLeaveExcel({ employees, leaves, weekStart });
  const media = MessageMedia.fromFilePath(filePath);
  const message = 'Hello Muskan. Please find the attached for the Leave tracker update for this week.';
  // WhatsApp phone format: '91xxxxxxxxxx@c.us'
  const waNumber = (phone.replace(/\D/g, '').replace(/^0+/, '') + '@c.us');
  await client.sendMessage(waNumber, media, { caption: message });
  // Optionally delete the file after sending
  fs.unlinkSync(filePath);
}

module.exports = { sendWeeklyLeaveSMS, getWhatsappClient };

// Initialize WhatsApp client on backend startup
console.log("Initializing WhatsApp client for WhatsApp Web QR...");
getWhatsappClient();
