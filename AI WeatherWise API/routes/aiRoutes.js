const express = require('express');
const router = express.Router();
const { getAiSummary, getAiRecommendation } = require('../controllers/aiController');

// POST /api/ai/summary
router.post('/summary', getAiSummary);

// POST /api/ai/recommendation
router.post('/recommendation', getAiRecommendation);

module.exports = router;
