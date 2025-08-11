const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  associateId: { type: Number, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['Employee', 'Manager', 'Lead'], required: true }
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
