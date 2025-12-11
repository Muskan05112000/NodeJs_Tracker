const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    date: String, // ISO format
    employee: String, // employee name
    type: { type: String, enum: ['Planned', 'Emergency', 'Sick', 'HalfDay'] },
    status: { type: String, enum: ['Active', 'Revoked'], default: 'Active' },
    revokedAt: Date,
    revokedBy: String,
    revocationReason: String
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
