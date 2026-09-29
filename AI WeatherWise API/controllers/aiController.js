const weatherService = require('../services/weatherService');
const geminiService = require('../services/geminiService');

// @desc    Generate AI weather summary
// @route   POST /api/ai/summary
// @access  Public / Authenticated
const getAiSummary = async (req, res, next) => {
  try {
    let weatherData = req.body.weatherData || req.body.weather;

    // If city is passed instead of full weather data, fetch weather first
    if (!weatherData && req.body.city) {
      const weatherResult = await weatherService.getWeatherByCity(req.body.city);
      weatherData = weatherResult.data;
    }

    if (!weatherData || !weatherData.city) {
      return res.status(400).json({
        success: false,
        message: 'Valid weather data or city is required in request body',
      });
    }

    const aiSummaryResult = await geminiService.generateWeatherSummary(weatherData);

    return res.status(200).json({
      success: true,
      data: {
        city: weatherData.city,
        source: aiSummaryResult.source,
        summary: aiSummaryResult.summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI weather recommendations (activities, clothing, general advice)
// @route   POST /api/ai/recommendation
// @access  Public / Authenticated
const getAiRecommendation = async (req, res, next) => {
  try {
    let weatherData = req.body.weatherData || req.body.weather;

    // If city is passed instead of full weather data, fetch weather first
    if (!weatherData && req.body.city) {
      const weatherResult = await weatherService.getWeatherByCity(req.body.city);
      weatherData = weatherResult.data;
    }

    if (!weatherData || !weatherData.city) {
      return res.status(400).json({
        success: false,
        message: 'Valid weather data or city is required in request body',
      });
    }

    const aiRecommendations = await geminiService.generateWeatherRecommendations(weatherData);

    return res.status(200).json({
      success: true,
      data: {
        city: weatherData.city,
        source: aiRecommendations.source,
        summary: aiRecommendations.summary,
        activities: aiRecommendations.activities,
        clothing: aiRecommendations.clothing,
        advice: aiRecommendations.advice,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAiSummary,
  getAiRecommendation,
};
