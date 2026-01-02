const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    date: String, // ISO format
    employee: String, // employee name
    type: { type: String, enum: ['Planned', 'Emergency', 'Sick', 'HalfDay'] },
    status: { type: String, enum: ['Active', 'Revoked'], default: 'Active' },
    revokedAt: Date,
    revokedBy: String,
    revocationReason: String,
    revocationRequest: {
        isRequested: { type: Boolean, default: false },
        reason: { type: String, default: '' },
        requestedAt: { type: Date }
    }
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
