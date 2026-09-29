/**
 * Gemini AI Service for AI WeatherWise
 * Uses @google/generative-ai SDK to generate weather summaries and personalized recommendations.
 * Includes intelligent fallback logic when API keys or services are unavailable.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Rule-based fallback recommendations when Gemini API is unconfigured or unavailable
const getFallbackAiInsights = (weatherData) => {
  const { city, temperature, weatherCondition, weatherDescription, humidity, windSpeed } = weatherData;
  const temp = Number(temperature) || 25;
  const condition = (weatherCondition || '').toLowerCase();

  let summary = `The weather in ${city} is currently ${weatherDescription || condition} with a temperature of ${temp}°C and ${humidity}% humidity.`;
  
  const activities = [];
  const clothing = [];
  const advice = [];

  // Activity recommendations
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
    activities.push('Indoor activities like visiting a museum, reading, or working indoors are recommended.');
    activities.push('Avoid outdoor sports and sports activities on wet surfaces.');
    clothing.push('Waterproof raincoat, umbrella, and water-resistant footwear.');
    advice.push('Carry an umbrella at all times and drive carefully on wet roads.');
  } else if (temp > 32) {
    activities.push('Plan indoor or shaded activities during peak daytime hours.');
    activities.push('Early morning or late evening walks are preferred over midday outdoor workouts.');
    clothing.push('Lightweight, breathable cotton clothing, sunglasses, and a wide-brimmed hat.');
    advice.push('Stay well-hydrated, use SPF 30+ sunscreen, and seek shade whenever outdoors.');
  } else if (temp < 15) {
    activities.push('Great time for brisk outdoor walks, warm beverages, or indoor fitness routines.');
    activities.push('Ensure proper thermal layering if spending extended time outside.');
    clothing.push('Warm sweater or jacket, cozy gloves, and layered clothing.');
    advice.push('Keep warm, protect against cold wind, and drink warm fluids.');
  } else {
    activities.push('Ideal weather for outdoor walks, jogging, cycling, and city sightseeing.');
    activities.push('Enjoy outdoor dining or parks in comfortable weather.');
    clothing.push('Comfortable casual wear, light layers, and comfortable walking shoes.');
    advice.push('Enjoy the pleasant weather, stay hydrated, and wear moderate sun protection.');
  }

  // Wind advice
  if (windSpeed > 8) {
    advice.push(`Expect breezy conditions with wind speeds of ${windSpeed} m/s. Secure light outdoor objects.`);
  }

  return {
    success: true,
    source: 'fallback',
    summary,
    activities,
    clothing,
    advice,
  };
};

const isPlaceholderKey = (key) => {
  if (!key || key.trim() === '') return true;
  const lower = key.trim().toLowerCase();
  return lower.includes('replace') || lower.startsWith('aq.');
};

const generateWeatherSummary = async (weatherData) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (isPlaceholderKey(apiKey)) {
    console.log('[GeminiService] GEMINI_API_KEY missing or placeholder. Returning fallback AI summary.');
    const fallback = getFallbackAiInsights(weatherData);
    return { success: true, source: 'fallback', summary: fallback.summary };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Act as an expert meteorologist. Provide a concise, engaging 2-3 sentence weather summary based on the following weather data:
City: ${weatherData.city}, ${weatherData.country}
Temperature: ${weatherData.temperature}°C (Feels like ${weatherData.feelsLike}°C)
Condition: ${weatherData.weatherCondition} (${weatherData.weatherDescription})
Humidity: ${weatherData.humidity}%
Wind Speed: ${weatherData.windSpeed} m/s
Pressure: ${weatherData.pressure} hPa

Return ONLY the plain text summary.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return {
      success: true,
      source: 'gemini',
      summary: responseText || getFallbackAiInsights(weatherData).summary,
    };
  } catch (error) {
    console.error(`[GeminiService] API Error: ${error.message}. Returning fallback summary.`);
    const fallback = getFallbackAiInsights(weatherData);
    return { success: true, source: 'fallback', summary: fallback.summary };
  }
};

const generateWeatherRecommendations = async (weatherData) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (isPlaceholderKey(apiKey)) {
    console.log('[GeminiService] GEMINI_API_KEY missing or placeholder. Returning fallback recommendations.');
    return getFallbackAiInsights(weatherData);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Act as an AI Weather Advisor. Based on this weather data:
City: ${weatherData.city}, ${weatherData.country}
Temperature: ${weatherData.temperature}°C (Feels like: ${weatherData.feelsLike}°C)
Condition: ${weatherData.weatherCondition} (${weatherData.weatherDescription})
Humidity: ${weatherData.humidity}%
Wind Speed: ${weatherData.windSpeed} m/s

Generate a JSON object containing personalized recommendations with exact keys:
"summary": string (concise weather summary)
"activities": array of strings (2-3 outdoor/travel/exercise recommendations)
"clothing": array of strings (2-3 clothing/gear items)
"advice": array of strings (2-3 general precautions, hydration/UV/weather advice)

Return ONLY valid JSON without markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean up potential markdown formatting like ```json ... ```
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsedData = JSON.parse(responseText);

    return {
      success: true,
      source: 'gemini',
      summary: parsedData.summary || getFallbackAiInsights(weatherData).summary,
      activities: parsedData.activities || getFallbackAiInsights(weatherData).activities,
      clothing: parsedData.clothing || getFallbackAiInsights(weatherData).clothing,
      advice: parsedData.advice || getFallbackAiInsights(weatherData).advice,
    };
  } catch (error) {
    console.error(`[GeminiService] Recommendation Error: ${error.message}. Returning fallback recommendations.`);
    return getFallbackAiInsights(weatherData);
  }
};

module.exports = {
  generateWeatherSummary,
  generateWeatherRecommendations,
  getFallbackAiInsights,
};
