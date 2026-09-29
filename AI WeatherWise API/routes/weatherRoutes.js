const express = require('express');
const router = express.Router();
const { getWeather, getWeatherInsights } = require('../controllers/weatherController');

// GET /api/weather/:city
router.get('/:city', getWeather);

// GET /api/weather/:city/insights
router.get('/:city/insights', getWeatherInsights);

module.exports = router;
