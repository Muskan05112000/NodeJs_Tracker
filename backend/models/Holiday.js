const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    occasion: String,
    date: String, // ISO format
    locations: [String],
    national: Boolean,
    country: String
});

module.exports = mongoose.model('Holiday', holidaySchema);
