const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { sendWeeklyLeaveMail } = require('../sendMail');
const { generateLeaveTrackerExcel } = require('../generateExcel');
const { format, addDays, isSameDay } = require('date-fns');
const fs = require('fs');

// Note: These routes are mounted at /api

// --- Leaves CRUD ---

// GET all leaves
router.get('/leaves', async (req, res) => {
    const leaves = await Leave.find();
    res.json(leaves);
});

// POST new leave
router.post('/leaves', async (req, res) => {
    try {
        const newLeave = new Leave(req.body);
        await newLeave.save();
        res.status(201).json(newLeave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update leave
router.put('/leaves/:id', async (req, res) => {
    try {
        const updated = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE leave
router.delete('/leaves/:id', async (req, res) => {
    try {
        const deleted = await Leave.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Leave not found' });
        res.status(204).end();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// REVOKE leave
router.put('/leaves/:id/revoke', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });
        // Prevent revocation if leave date is in the past
        const today = new Date();
        const leaveDate = new Date(leave.date);
        if (leaveDate < today.setHours(0, 0, 0, 0)) {
            return res.status(400).json({ error: 'Cannot revoke a leave that is in the past.' });
        }
        leave.status = 'Revoked';
        leave.revokedAt = new Date();
        leave.revokedBy = req.body.revokedBy || 'self';
        leave.revocationReason = req.body.revocationReason || '';
        await leave.save();
        res.json({ success: true, leave });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- Utility Routes ---

// Download Excel
router.post('/download-leave-excel', async (req, res) => {
    const { employees, leaves, weekStart, weekDays } = req.body;
    if (!employees || !leaves || !weekStart) {
        return res.status(400).json({ error: 'Missing employees, leaves, or weekStart' });
    }
    try {
        console.log('Download Excel payload:', req.body);
        const { fileName, filePath } = await generateLeaveTrackerExcel({ employees, leaves, weekStart, weekDays });
        res.download(filePath, fileName, err => {
            if (err) {
                res.status(500).json({ error: 'Failed to download file' });
            } else {
                // Optionally delete file after sending
                setTimeout(() => { try { fs.unlinkSync(filePath); } catch (e) { } }, 2000);
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Leave Email
router.post('/send-leave-email', async (req, res) => {
    console.log('Received send-leave-email body:', req.body);
    const { to, subject, employees, leaves, weekStart, user, appPassword } = req.body;
    if (!to || !subject || !employees || !leaves || !weekStart) {
        return res.status(400).json({ error: 'Missing to, subject, employees, leaves, or weekStart' });
    }
    try {
        // Build week days (Mon-Fri)
        const weekDaysArr = [];
        const start = new Date(weekStart);
        for (let i = 0; i < 5; i++) {
            weekDaysArr.push(addDays(start, i));
        }
        // Build HTML table
        let html = `<h3>Leave update for this week</h3><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;min-width:400px;text-align:center;">
      <thead><tr><th>Employee Name</th>`;
        html += weekDaysArr.map(d => `<th>${format(d, "dd MMM")}</th>`).join("");
        html += `</tr></thead><tbody>`;
        employees.forEach(emp => {
            html += `<tr><td style='font-weight:600'>${emp.name}</td>`;
            weekDaysArr.forEach(day => {
                const leave = leaves.find(l => l.employee === emp.name && isSameDay(new Date(l.date), day));
                let code = "";
                if (leave) {
                    if (leave.type === "Planned") code = "PL";
                    else if (leave.type === "Emergency") code = "EL";
                    else if (leave.type === "Sick") code = "SL";
                }
                html += `<td>${code}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        // Support dynamic user/appPassword from frontend
        const sendingUser = req.body.user || req.body.mailTo || to;
        const sendingPass = req.body.appPassword;
        await sendWeeklyLeaveMail({ to, subject, html, user: sendingUser, appPassword: sendingPass });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
