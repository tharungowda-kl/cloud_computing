/**
 * GraminSeva - Weather Updates & Agro-Advisory Script
 */

let currentDistrict = 'mandya';

document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('district-select');
  const searchBtn = document.getElementById('weather-search-btn');
  const customInput = document.getElementById('weather-custom-input');

  fetchWeather(currentDistrict);

  if (districtSelect) {
    districtSelect.addEventListener('change', (e) => {
      currentDistrict = e.target.value;
      if (customInput) customInput.value = '';
      fetchWeather(currentDistrict);
    });
  }

  if (searchBtn && customInput) {
    searchBtn.addEventListener('click', () => {
      const val = customInput.value.trim();
      if (val) {
        currentDistrict = val;
        fetchWeather(currentDistrict);
      }
    });

    customInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const val = customInput.value.trim();
        if (val) {
          currentDistrict = val;
          fetchWeather(currentDistrict);
        }
      }
    });
  }
});

async function fetchWeather(location) {
  const container = document.getElementById('weather-container');
  if (container) {
    container.style.opacity = '0.6';
  }

  try {
    const res = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
    const data = await res.json();

    if (data.success && data.data) {
      renderWeatherData(data.data, data.sourceLabel);
    } else {
      showToast('Could not retrieve weather for specified location.', 'error');
    }
  } catch (err) {
    console.error('Weather fetch error:', err);
    showToast('Failed to connect to weather service.', 'error');
  } finally {
    if (container) container.style.opacity = '1';
  }
}

function renderWeatherData(weather, sourceLabel) {
  // Update Source Notice
  const sourceEl = document.getElementById('weather-source-label');
  if (sourceEl) {
    sourceEl.textContent = sourceLabel || 'Demonstration Weather Model';
  }

  // Hero Card
  const locEl = document.getElementById('weather-loc-name');
  if (locEl) locEl.textContent = weather.location;

  const tempEl = document.getElementById('weather-temp-val');
  if (tempEl) tempEl.textContent = `${weather.temp}°C`;

  const condEl = document.getElementById('weather-condition-val');
  if (condEl) condEl.textContent = weather.condition;

  const humidityEl = document.getElementById('weather-humidity-val');
  if (humidityEl) humidityEl.textContent = `${weather.humidity}%`;

  const windEl = document.getElementById('weather-wind-val');
  if (windEl) windEl.textContent = weather.windSpeed;

  const rainEl = document.getElementById('weather-rain-val');
  if (rainEl) rainEl.textContent = weather.rainfallProb || '10%';

  const soilEl = document.getElementById('weather-soil-val');
  if (soilEl) soilEl.textContent = weather.soilMoisture || 'Adequate';

  // Agro Advisory
  const advEl = document.getElementById('weather-advisory-text');
  if (advEl) advEl.textContent = weather.advisory;

  // 5-Day Forecast
  const forecastContainer = document.getElementById('forecast-container');
  if (forecastContainer && Array.isArray(weather.forecast)) {
    forecastContainer.innerHTML = weather.forecast.map(item => `
      <div class="forecast-card">
        <div class="forecast-day">${item.day}</div>
        <div style="font-size: 1.5rem; margin: 4px 0;">🌤️</div>
        <div class="forecast-temp">${item.temp}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">${item.condition}</div>
        <div style="font-size: 0.75rem; color: var(--secondary); font-weight: 700; margin-top: 4px;">🌧️ Rain: ${item.rain}</div>
      </div>
    `).join('');
  }
}
