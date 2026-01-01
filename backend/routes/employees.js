const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const User = require('../models/User');

// GET all employees
router.get('/', async (req, res) => {
    const employees = await Employee.find();
    res.json(employees);
});

// POST new employee
router.post('/', async (req, res) => {
    try {
        console.log('Incoming /api/employees POST:', req.body);
        // Validate associateId
        if (!req.body.associateId) {
            console.log('associateId missing');
            return res.status(400).json({ error: 'associateId is required' });
        }
        // Build employee object
        const empData = {
            ...req.body,
            associateId: Number(req.body.associateId),
        };
        console.log('Creating new Employee instance...');
        const newEmp = new Employee(empData);
        console.log('Saving new Employee to DB...');
        await newEmp.save();
        console.log('Employee saved:', newEmp);
        // Also create a User credential for this employee
        console.log('Hashing password for User credential...');
        const passwordToSet = newEmp.role === 'Manager' || newEmp.role === 'Lead' ? 'Manager@2024' : 'Welcome@123';
        const hashedPassword = await bcrypt.hash(passwordToSet, 10);
        // Use associateId as the unique key for User
        console.log('Creating User credential:', { associateId: newEmp.associateId, role: 'Employee' });
        await User.create({ username: newEmp.name, associateId: newEmp.associateId, password: hashedPassword, role: newEmp.role });
        console.log('User credential created');
        res.status(201).json(newEmp);
        console.log('Response sent to frontend');
    } catch (err) {
        console.error('Error in /api/employees POST:', err);
        res.status(400).json({ error: err.message });
    }
});

// PUT update employee
router.put('/:name', async (req, res) => {
    try {
        const { name, associateId, location, team, oldAssociateId } = req.body;
        // Update employee
        const updated = await Employee.findOneAndUpdate(
            { name: req.params.name },
            { name, associateId, location, team },
            { new: true }
        );
        // Update user as well
        const userQuery = oldAssociateId ? { associateId: oldAssociateId } : { associateId };
        console.log('Updating User:', userQuery, { username: name, associateId });
        await User.findOneAndUpdate(
            userQuery,
            { username: name, associateId }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE employee
router.delete('/:associateId', async (req, res) => {
    const emp = await Employee.findOneAndDelete({ associateId: Number(req.params.associateId) });
    if (emp) {
        // Also delete the credential for this employee (by associateId)
        await User.deleteOne({ associateId: emp.associateId });
    }
    res.status(204).end();
});

module.exports = router;
