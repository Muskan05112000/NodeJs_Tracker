const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// GET wrapped trigger config
router.get('/wrapped-trigger', async (req, res) => {
    try {
        const config = await Config.findOne({ key: 'wrappedTriggerAt' });
        console.log("Serving wrapped config:", config);
        res.json({ value: config ? config.value : null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST update trigger config
router.post('/trigger-wrapped', async (req, res) => {
    try {
        const now = Date.now().toString();
        const config = await Config.findOneAndUpdate(
            { key: 'wrappedTriggerAt' },
            { value: now },
            { upsert: true, new: true }
        );
        console.log("Updated wrapped config:", config);
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
