const express = require('express');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  try {
    const user = await User.findOne({ associateId: Number(username) });
    console.log('User found:', user);
    if (!user) {
      console.log('No user found for associateId:', username);
      return res.status(401).json({ error: 'Invalid Username or password' });
    }
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      console.log('Password does not match for user:', username);
      return res.status(401).json({ error: 'Invalid Username or password' });
    }
    // Only enforce role-based restrictions for default passwords
    if (password === 'Welcome@123' && user.role !== 'Employee') {
      console.log('Default password used but role mismatch:', user.role);
      return res.status(401).json({ error: 'Invalid Username or password' });
    }
    if (password === 'Manager@2024' && !(user.role === 'Manager' || user.role === 'Lead')) {
      console.log('Manager password used but role mismatch:', user.role);
      return res.status(401).json({ error: 'Invalid Username or password' });
    }
    console.log('Login successful for:', username);
    res.json({ associateId: user.associateId, role: user.role });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
