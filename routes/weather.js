const express = require('express');
const router = express.Router();

// Regional weather presets for rural districts
const ruralDistrictsWeather = {
  'mandya': {
    location: 'Mandya Rural District, Karnataka',
    temp: 28,
    condition: 'Partly Cloudy with Gentle Breeze',
    weatherIcon: 'cloud-sun',
    humidity: 68,
    windSpeed: '12 km/h',
    rainfallProb: '20%',
    uvIndex: 'Moderate (5)',
    soilMoisture: 'Adequate (32%)',
    advisory: 'Favorable conditions for paddy weeding and intercultivation in sugarcane. Light morning showers possible.',
    forecast: [
      { day: 'Today', temp: '28°C / 21°C', condition: 'Partly Cloudy', rain: '20%' },
      { day: 'Tomorrow', temp: '29°C / 20°C', condition: 'Scattered Showers', rain: '65%' },
      { day: 'Wednesday', temp: '27°C / 21°C', condition: 'Moderate Rain', rain: '80%' },
      { day: 'Thursday', temp: '28°C / 22°C', condition: 'Cloudy', rain: '40%' },
      { day: 'Friday', temp: '30°C / 21°C', condition: 'Sunny & Clear', rain: '10%' }
    ]
  },
  'dharwad': {
    location: 'Dharwad Rural, Karnataka',
    temp: 31,
    condition: 'Sunny & Dry',
    weatherIcon: 'sun',
    humidity: 48,
    windSpeed: '14 km/h',
    rainfallProb: '5%',
    uvIndex: 'High (7)',
    soilMoisture: 'Moderate (24%)',
    advisory: 'Ideal weather for harvesting pulses and solar drying of grains. Schedule evening drip irrigation.',
    forecast: [
      { day: 'Today', temp: '31°C / 19°C', condition: 'Sunny', rain: '5%' },
      { day: 'Tomorrow', temp: '32°C / 20°C', condition: 'Clear Sky', rain: '0%' },
      { day: 'Wednesday', temp: '31°C / 19°C', condition: 'Sunny', rain: '10%' },
      { day: 'Thursday', temp: '30°C / 18°C', condition: 'Passing Clouds', rain: '15%' },
      { day: 'Friday', temp: '29°C / 19°C', condition: 'Partly Cloudy', rain: '25%' }
    ]
  },
  'pune': {
    location: 'Pune Rural / Baramati, Maharashtra',
    temp: 27,
    condition: 'Overcast & Cool',
    weatherIcon: 'cloud',
    humidity: 74,
    windSpeed: '16 km/h',
    rainfallProb: '45%',
    uvIndex: 'Low (3)',
    soilMoisture: 'High (40%)',
    advisory: 'High humidity may induce downy mildew in grapevines and tomatoes. Monitor closely and ensure field drainage.',
    forecast: [
      { day: 'Today', temp: '27°C / 20°C', condition: 'Overcast', rain: '45%' },
      { day: 'Tomorrow', temp: '26°C / 19°C', condition: 'Light Drizzle', rain: '60%' },
      { day: 'Wednesday', temp: '28°C / 20°C', condition: 'Cloudy', rain: '30%' },
      { day: 'Thursday', temp: '29°C / 21°C', condition: 'Sunny Spells', rain: '15%' },
      { day: 'Friday', temp: '30°C / 20°C', condition: 'Clear', rain: '10%' }
    ]
  },
  'coimbatore': {
    location: 'Coimbatore Rural / Pollachi, Tamil Nadu',
    temp: 29,
    condition: 'Pleasant & Breezy',
    weatherIcon: 'wind',
    humidity: 62,
    windSpeed: '18 km/h',
    rainfallProb: '15%',
    uvIndex: 'Moderate (6)',
    soilMoisture: 'Good (30%)',
    advisory: 'Breezy climate is suitable for coconut basin mulching and fertilizer application.',
    forecast: [
      { day: 'Today', temp: '29°C / 22°C', condition: 'Breezy', rain: '15%' },
      { day: 'Tomorrow', temp: '30°C / 22°C', condition: 'Partly Cloudy', rain: '20%' },
      { day: 'Wednesday', temp: '29°C / 21°C', condition: 'Isolated Showers', rain: '40%' },
      { day: 'Thursday', temp: '31°C / 22°C', condition: 'Sunny', rain: '10%' },
      { day: 'Friday', temp: '31°C / 23°C', condition: 'Clear', rain: '10%' }
    ]
  },
  'varanasi': {
    location: 'Varanasi Rural, Uttar Pradesh',
    temp: 26,
    condition: 'Mild Foggy Morning & Pleasant Afternoon',
    weatherIcon: 'smog',
    humidity: 72,
    windSpeed: '9 km/h',
    rainfallProb: '0%',
    uvIndex: 'Moderate (4)',
    soilMoisture: 'Good (28%)',
    advisory: 'Conducive temperature for wheat crown root initiation and mustard flowering. Keep irrigation channels clear.',
    forecast: [
      { day: 'Today', temp: '26°C / 14°C', condition: 'Mild Fog / Clear', rain: '0%' },
      { day: 'Tomorrow', temp: '27°C / 13°C', condition: 'Sunny', rain: '0%' },
      { day: 'Wednesday', temp: '26°C / 14°C', condition: 'Clear', rain: '0%' },
      { day: 'Thursday', temp: '25°C / 12°C', condition: 'Sunny', rain: '0%' },
      { day: 'Friday', temp: '26°C / 13°C', condition: 'Sunny', rain: '0%' }
    ]
  },
  'jaipur': {
    location: 'Jaipur Rural / Chomu, Rajasthan',
    temp: 30,
    condition: 'Dry & Clear Sunlight',
    weatherIcon: 'sun',
    humidity: 35,
    windSpeed: '11 km/h',
    rainfallProb: '0%',
    uvIndex: 'High (8)',
    soilMoisture: 'Low (18%)',
    advisory: 'Low humidity increases evapotranspiration. Ensure drip irrigation in vegetable clusters during night hours.',
    forecast: [
      { day: 'Today', temp: '30°C / 16°C', condition: 'Clear & Bright', rain: '0%' },
      { day: 'Tomorrow', temp: '31°C / 17°C', condition: 'Sunny', rain: '0%' },
      { day: 'Wednesday', temp: '32°C / 18°C', condition: 'Sunny', rain: '0%' },
      { day: 'Thursday', temp: '30°C / 16°C', condition: 'Clear', rain: '0%' },
      { day: 'Friday', temp: '30°C / 15°C', condition: 'Clear', rain: '0%' }
    ]
  }
};

// GET weather for location
router.get('/', async (req, res) => {
  try {
    const rawLoc = (req.query.location || 'mandya').toLowerCase().trim();
    const apiKey = process.env.WEATHER_API_KEY;

    // Check if live API key is configured
    if (apiKey && apiKey !== 'demo_key' && apiKey !== '') {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(rawLoc)}&appid=${apiKey}&units=metric`);
        if (response.ok) {
          const liveData = await response.json();
          return res.json({
            success: true,
            isLiveApi: true,
            sourceLabel: 'Live OpenWeatherMap API',
            data: {
              location: `${liveData.name}, ${liveData.sys?.country}`,
              temp: Math.round(liveData.main.temp),
              condition: liveData.weather[0].description,
              weatherIcon: 'cloud-sun',
              humidity: liveData.main.humidity,
              windSpeed: `${Math.round(liveData.wind.speed * 3.6)} km/h`,
              rainfallProb: 'N/A (Live station)',
              advisory: 'Live weather retrieved. Adjust irrigation and outdoor fieldwork according to real-time readings.'
            }
          });
        }
      } catch (liveErr) {
        console.warn('Live weather API fetch failed, falling back to demonstration preset:', liveErr.message);
      }
    }

    // Match demonstration preset or generate dynamic district data
    let matchedData = ruralDistrictsWeather[rawLoc];

    if (!matchedData) {
      // Find partial match
      const key = Object.keys(ruralDistrictsWeather).find(k => rawLoc.includes(k) || k.includes(rawLoc));
      if (key) {
        matchedData = ruralDistrictsWeather[key];
      } else {
        // Dynamic fallback for any user-entered village or district name
        const capitalized = rawLoc.charAt(0).toUpperCase() + rawLoc.slice(1);
        matchedData = {
          location: `${capitalized} Rural Taluk`,
          temp: 28,
          condition: 'Partly Cloudy & Humid',
          weatherIcon: 'cloud-sun',
          humidity: 64,
          windSpeed: '13 km/h',
          rainfallProb: '25%',
          uvIndex: 'Moderate (5)',
          soilMoisture: 'Adequate (30%)',
          advisory: `Standard seasonal agricultural conditions for ${capitalized}. Monitor soil moisture before spraying.`,
          forecast: [
            { day: 'Today', temp: '28°C / 20°C', condition: 'Partly Cloudy', rain: '25%' },
            { day: 'Tomorrow', temp: '29°C / 21°C', condition: 'Passing Showers', rain: '50%' },
            { day: 'Wednesday', temp: '27°C / 19°C', condition: 'Cloudy', rain: '30%' },
            { day: 'Thursday', temp: '28°C / 20°C', condition: 'Sunny Spells', rain: '15%' },
            { day: 'Friday', temp: '30°C / 21°C', condition: 'Clear', rain: '10%' }
          ]
        };
      }
    }

    res.json({
      success: true,
      isLiveApi: false,
      sourceLabel: 'Demonstration Weather Model (Ready for OpenWeatherMap integration)',
      availableDistricts: Object.keys(ruralDistrictsWeather).map(k => ({
        id: k,
        label: ruralDistrictsWeather[k].location
      })),
      data: matchedData
    });
  } catch (err) {
    console.error('Weather route error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather information.'
    });
  }
});

module.exports = router;
