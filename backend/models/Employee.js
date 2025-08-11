const mongoose = require('mongoose');
require('mongoose-long')(mongoose);

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
  location: String,
  team: String,
  associateId: { type: Number, required: true, unique: true }, // Regular integer, required and unique
  role: { type: String, enum: ['Employee', 'Manager', 'Lead'], default: 'Employee' }
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
