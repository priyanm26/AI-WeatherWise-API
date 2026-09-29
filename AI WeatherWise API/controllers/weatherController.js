const weatherService = require('../services/weatherService');
const geminiService = require('../services/geminiService');

// @desc    Get current weather for a city
// @route   GET /api/weather/:city
// @access  Public / Authenticated
const getWeather = async (req, res, next) => {
  try {
    const city = req.params.city || req.query.city;

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City name is required',
      });
    }

    const weatherResult = await weatherService.getWeatherByCity(city.trim());

    return res.status(200).json(weatherResult);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current weather + combined AI insights for a city
// @route   GET /api/weather/:city/insights
// @access  Public / Authenticated
const getWeatherInsights = async (req, res, next) => {
  try {
    const city = req.params.city || req.query.city;

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City name is required',
      });
    }

    // Step 1: Fetch current weather
    const weatherResult = await weatherService.getWeatherByCity(city.trim());
    const weatherData = weatherResult.data;

    // Step 2: Request AI insights using weather data
    const aiResult = await geminiService.generateWeatherRecommendations(weatherData);

    return res.status(200).json({
      success: true,
      data: {
        weather: {
          city: weatherData.city,
          country: weatherData.country,
          temperature: weatherData.temperature,
          feelsLike: weatherData.feelsLike,
          humidity: weatherData.humidity,
          pressure: weatherData.pressure,
          windSpeed: weatherData.windSpeed,
          condition: weatherData.weatherCondition,
          description: weatherData.weatherDescription,
          visibility: weatherData.visibility,
          source: weatherResult.source,
          timestamp: weatherData.timestamp,
        },
        ai: {
          source: aiResult.source,
          summary: aiResult.summary,
          activities: aiResult.activities,
          clothing: aiResult.clothing,
          advice: aiResult.advice,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeather,
  getWeatherInsights,
};
