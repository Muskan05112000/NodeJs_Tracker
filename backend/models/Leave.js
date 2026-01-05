const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    date: String, // ISO format
    employee: String, // employee name
    type: { type: String, enum: ['Planned', 'Emergency', 'Sick', 'HalfDay'] },
    status: { type: String, enum: ['Active', 'Revoked'], default: 'Active' },
    revokedAt: Date,
    revokedBy: String,
    revocationReason: String,
    notificationDismissed: { type: Boolean, default: false }, // For clearing history
    revocationRequest: {
        isRequested: { type: Boolean, default: false },
        reason: { type: String, default: '' },
        requestedAt: { type: Date },
        isRejected: { type: Boolean, default: false },
        rejectedBy: String
    }
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
