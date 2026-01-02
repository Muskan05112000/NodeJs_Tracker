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
// REVOKE leave or REQUEST revocation
router.put('/leaves/:id/revoke', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leaveDate = new Date(leave.date);

        // Check if user is Lead (can skip approval)
        // Note: req.user is set by authMiddleware. Ensure 'Lead' role check is correct.
        const isLead = req.user && req.user.role === 'Lead';
        const isPast = leaveDate < today;

        if (isPast && !isLead) {
            // Request Revocation instead of immediate revoke
            leave.revocationRequest = {
                isRequested: true,
                reason: req.body.revocationReason || '',
                requestedAt: new Date()
            };
            await leave.save();
            return res.json({ success: true, message: 'Revocation requested. Manager approval required.', approvalRequired: true, leave });
        }

        // Standard Revocation (Future date OR Lead role)
        leave.status = 'Revoked';
        leave.revokedAt = new Date();
        leave.revokedBy = req.body.revokedBy || req.user?.username || 'self';
        leave.revocationReason = req.body.revocationReason || '';
        // Clear any pending request if force-revoked
        leave.revocationRequest = { isRequested: false, reason: '', requestedAt: null };

        await leave.save();
        res.json({ success: true, leave });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DECLINE Revocation (Manager action)
router.put('/leaves/:id/decline-revocation', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });

        // Update revocation request status
        leave.revocationRequest = {
            isRequested: false, // No longer pending
            isRejected: true,
            reason: leave.revocationRequest.reason, // Keep original reason
            requestedAt: leave.revocationRequest.requestedAt,
            rejectedBy: req.user?.username || 'Manager',
            rejectedAt: new Date(),
            rejectionReason: req.body.reason || ''
        };
        // Leave status remains 'Active'

        await leave.save();
        res.json({ success: true, leave });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET Pending Revocations & History (Notifications)
router.get('/leaves/pending-revocation', async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const isManager = req.user && (req.user.role === 'Manager' || req.user.role === 'Lead');
        const username = req.user ? req.user.username : null;

        let query = {
            $or: [
                { 'revocationRequest.isRequested': true, status: 'Active' }, // Pending
                { status: 'Revoked', revokedAt: { $gte: sixMonthsAgo } },    // Approved History
                { 'revocationRequest.isRejected': true, 'revocationRequest.rejectedAt': { $gte: sixMonthsAgo } } // Rejected History
            ]
        };

        // If not manager, only show their own leaves
        if (!isManager && username) {
            query.employee = username;
        }

        const leaves = await Leave.find(query).sort({
            'revocationRequest.requestedAt': -1,
            revokedAt: -1,
            'revocationRequest.rejectedAt': -1
        });

        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// APPROVE Revocation (Manager action)
router.put('/leaves/:id/approve-revocation', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });

        leave.status = 'Revoked';
        leave.revokedAt = new Date();
        leave.revokedBy = req.user?.username || 'Manager'; // Approved by
        leave.revocationReason = leave.revocationRequest.reason; // Use the reason from request

        // Clear request
        leave.revocationRequest = { isRequested: false, reason: '', requestedAt: null };

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
