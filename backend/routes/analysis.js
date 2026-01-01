const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

router.get('/top-leavers', analysisController.getTopLeavers);
router.get('/wrapped', analysisController.getLeaveWrapped);

module.exports = router;
