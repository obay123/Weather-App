// Configuration and API Details
const API_KEY = '0268b42a2b304542a02194048242305';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM Element Selectors
const elements = {
    locationInput: document.getElementById('location-input'),
    searchBtn: document.getElementById('search-btn'),
    weatherInfo: document.getElementById('weather-info'),
    errorMessage: document.getElementById('error-message'),
    loadingIndicator: document.getElementById('loading'),
    additionalInfo: {
        humidity: document.getElementById('humidity-info').querySelector('p'),
        wind: document.getElementById('wind-info').querySelector('p'),
        pressure: document.getElementById('pressure-info').querySelector('p'),
        uv: document.getElementById('uv-info').querySelector('p')
    },
    themeToggle: document.getElementById('theme-toggle')
};

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    elements.themeToggle.checked = savedTheme === 'dark';
}

elements.themeToggle.addEventListener('change', () => {
    const theme = elements.themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// Weather Data Fetching
async function fetchWeatherData(location) {
    try {
        // Show loading, clear previous data
        elements.loadingIndicator.style.display = 'block';
        elements.weatherInfo.innerHTML = '';
        elements.errorMessage.textContent = '';
        
        // Reset additional info to default
        Object.values(elements.additionalInfo).forEach(el => el.textContent = '-');

        const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}`);
        
        if (!response.ok) {
            throw new Error('Location not found');
        }

        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        handleError(error);
    } finally {
        elements.loadingIndicator.style.display = 'none';
    }
}

function displayWeatherData(data) {
    const { location, current } = data;

    // Main Weather Info
    elements.weatherInfo.innerHTML = `
        <h2>${location.name}, ${location.country}</h2>
        <img src="https:${current.condition.icon}" alt="${current.condition.text}" class="weather-icon">
        <h3>${current.condition.text}</h3>
        <div class="temperature">
            <span class="temp-c">${current.temp_c}°C</span> | 
            <span class="temp-f">${current.temp_f}°F</span>
        </div>
    `;

    // Update Additional Info Cards with new data
    elements.additionalInfo.humidity.textContent = `${current.humidity}%`;
    elements.additionalInfo.wind.textContent = `${current.wind_kph} km/h ${current.wind_dir}`;
    elements.additionalInfo.pressure.textContent = `${current.pressure_mb} mb`;
    elements.additionalInfo.uv.textContent = current.uv;
}

function handleError(error) {
    elements.errorMessage.textContent = error.message || 'Unable to fetch weather data';
    
    // Reset weather info and additional info
    elements.weatherInfo.innerHTML = '<p class="placeholder-text">Search for a location to view weather details</p>';
    Object.values(elements.additionalInfo).forEach(el => el.textContent = '-');
}

// Event Listeners
function initEventListeners() {
    // Search button click
    elements.searchBtn.addEventListener('click', () => {
        const location = elements.locationInput.value.trim();
        if (location) fetchWeatherData(location);
    });

    // Enter key press
    elements.locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const location = elements.locationInput.value.trim();
            if (location) fetchWeatherData(location);
        }
    });
}

// Initialize the application
function init() {
    initTheme();
    initEventListeners();
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);