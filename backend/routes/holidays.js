const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');

// GET all holidays
router.get('/', async (req, res) => {
    const holidays = await Holiday.find();
    res.json(holidays);
});

// POST new holiday
router.post('/', async (req, res) => {
    try {
        const { occasion, date, locations, national, country } = req.body;
        if (!occasion || !date || !locations || locations.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const holiday = new Holiday({ occasion, date, locations, national: !!national, country });
        await holiday.save();
        res.status(201).json(holiday);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE holiday
router.delete('/:id', async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
