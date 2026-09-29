require('dotenv').config();
const { getWeatherByCity } = require('../services/weatherService');
const { generateWeatherSummary, generateWeatherRecommendations } = require('../services/geminiService');
const mongoose = require('mongoose');

async function testAll() {
  console.log('--- ENV KEYS CHECK ---');
  console.log('PORT:', process.env.PORT);
  console.log('MONGO_URI:', process.env.MONGO_URI ? 'FOUND' : 'MISSING');
  console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? 'FOUND' : 'MISSING');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL);

  console.log('\n--- TESTING OPENWEATHER API ---');
  const weatherRes = await getWeatherByCity('Chennai');
  console.log('Weather result:', JSON.stringify(weatherRes, null, 2));

  console.log('\n--- TESTING GEMINI API ---');
  const summaryRes = await generateWeatherSummary(weatherRes.data);
  console.log('Summary result:', JSON.stringify(summaryRes, null, 2));

  const recoRes = await generateWeatherRecommendations(weatherRes.data);
  console.log('Recommendation result:', JSON.stringify(recoRes, null, 2));

  console.log('\n--- TESTING MONGO DB CONNECTIVITY ---');
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connected Successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
  }
}

testAll();
