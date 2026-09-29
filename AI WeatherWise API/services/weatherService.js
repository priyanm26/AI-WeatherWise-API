/**
 * Weather Service for AI WeatherWise
 * Communicates with OpenWeatherMap API or provides structured fallback weather data when unavailable.
 */

const getMockWeatherData = (cityQuery) => {
  const normalizedCity = cityQuery.trim().toLowerCase();
  
  // Pre-configured mock data for standard cities or realistic dynamic defaults
  const cityMocks = {
    chennai: { city: 'Chennai', country: 'IN', temp: 31, feels: 36, humidity: 72, condition: 'Clouds', description: 'Partly cloudy sky', wind: 4.2 },
    london: { city: 'London', country: 'GB', temp: 16, feels: 15, humidity: 80, condition: 'Rain', description: 'Light rain drizzle', wind: 5.1 },
    'new york': { city: 'New York', country: 'US', temp: 22, feels: 21, humidity: 55, condition: 'Clear', description: 'Clear sky', wind: 3.8 },
    tokyo: { city: 'Tokyo', country: 'JP', temp: 25, feels: 26, humidity: 65, condition: 'Clear', description: 'Sunny day', wind: 2.9 },
    paris: { city: 'Paris', country: 'FR', temp: 19, feels: 18, humidity: 60, condition: 'Clouds', description: 'Scattered clouds', wind: 4.0 },
    mumbai: { city: 'Mumbai', country: 'IN', temp: 29, feels: 33, humidity: 78, condition: 'Haze', description: 'Hazy sunshine', wind: 3.5 },
  };

  const formattedCityName = cityQuery.charAt(0).toUpperCase() + cityQuery.slice(1);
  const baseMock = cityMocks[normalizedCity] || {
    city: formattedCityName,
    country: 'Global',
    temp: 26,
    feels: 27,
    humidity: 60,
    condition: 'Clear',
    description: 'Fair weather conditions',
    wind: 3.5,
  };

  return {
    success: true,
    source: 'fallback',
    data: {
      city: baseMock.city,
      country: baseMock.country,
      temperature: baseMock.temp,
      feelsLike: baseMock.feels,
      humidity: baseMock.humidity,
      pressure: 1013,
      windSpeed: baseMock.wind,
      weatherCondition: baseMock.condition,
      weatherDescription: baseMock.description,
      visibility: 10000,
      timestamp: new Date().toISOString(),
    },
  };
};

const getWeatherByCity = async (city) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'replace_with_openweather_api_key') {
    console.log(`[WeatherService] OPENWEATHER_API_KEY missing. Returning fallback weather data for '${city}'.`);
    return getMockWeatherData(city);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`[WeatherService] OpenWeather API responded with status ${response.status}. Using fallback weather data.`);
      return getMockWeatherData(city);
    }

    const rawData = await response.json();

    return {
      success: true,
      source: 'live',
      data: {
        city: rawData.name || city,
        country: rawData.sys ? rawData.sys.country : '',
        temperature: Math.round(rawData.main.temp),
        feelsLike: Math.round(rawData.main.feels_like),
        humidity: rawData.main.humidity,
        pressure: rawData.main.pressure,
        windSpeed: rawData.wind ? rawData.wind.speed : 0,
        weatherCondition: rawData.weather && rawData.weather[0] ? rawData.weather[0].main : 'Clear',
        weatherDescription: rawData.weather && rawData.weather[0] ? rawData.weather[0].description : 'Clear sky',
        visibility: rawData.visibility || 10000,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(`[WeatherService] Fetch error: ${error.message}. Returning fallback weather data.`);
    return getMockWeatherData(city);
  }
};

module.exports = { getWeatherByCity, getMockWeatherData };
