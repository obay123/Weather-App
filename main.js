// Configuration and API Details
const API_KEY = '0268b42a2b304542a02194048242305';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM Element Selectors
const elements = {
    locationInput: document.getElementById('location-input'),
    searchBtn: document.getElementById('search-btn'),
    geolocationBtn: document.getElementById('geolocation-btn'),
    weatherInfo: document.getElementById('weather-info'),
    errorMessage: document.getElementById('error-message'),
    loadingIndicator: document.getElementById('loading'),
    locationSuggestions: document.getElementById('location-suggestions'),
    hourlyForecast: document.getElementById('hourly-forecast'),
    lastUpdated: document.getElementById('last-updated'),
    additionalInfo: {
        humidity: document.getElementById('humidity-info').querySelector('p'),
        wind: document.getElementById('wind-info').querySelector('p'),
        pressure: document.getElementById('pressure-info').querySelector('p'),
        uv: document.getElementById('uv-info').querySelector('p')
    },
    themeToggle: document.getElementById('theme-toggle')
};

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

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

// Location Suggestions
async function fetchLocationSuggestions(query) {
    try {
        const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${query}`);
        const suggestions = await response.json();
        
        elements.locationSuggestions.innerHTML = suggestions.map(location => 
            `<div class="suggestion-item" data-name="${location.name}, ${location.country}">
                ${location.name}, ${location.country}
            </div>`
        ).join('');
        
        elements.locationSuggestions.style.display = suggestions.length ? 'block' : 'none';
        
        // Add click event to suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const locationName = e.target.getAttribute('data-name');
                elements.locationInput.value = locationName;
                elements.locationSuggestions.style.display = 'none';
                fetchWeatherData(locationName);
            });
        });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

// Geolocation
function getUserLocation() {
    if ("geolocation" in navigator) {
        elements.loadingIndicator.style.display = 'block';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(`${latitude},${longitude}`);
            },
            (error) => {
                handleError(new Error('Geolocation access denied or unavailable'));
            }
        );
    } else {
        handleError(new Error('Geolocation not supported'));
    }
}

// Weather Data Fetching
async function fetchWeatherData(location) {
    try {
        // Show loading, clear previous data
        elements.loadingIndicator.style.display = 'block';
        elements.weatherInfo.innerHTML = '';
        elements.errorMessage.textContent = '';
        
        // Reset additional info to default
        Object.values(elements.additionalInfo).forEach(el => el.textContent = '-');
        elements.hourlyForecast.innerHTML = '';

        // Fetch current weather and forecast
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}`),
            fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=1&hours=24`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Location not found');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayWeatherData(currentData);
        displayHourlyForecast(forecastData);
    } catch (error) {
        handleError(error);
    } finally {
        elements.loadingIndicator.style.display = 'none';
        elements.lastUpdated.textContent = `Last Updated: ${new Date().toLocaleString()}`;
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

function displayHourlyForecast(data) {
    const hourlyData = data.forecast.forecastday[0].hour;
    
    elements.hourlyForecast.innerHTML = hourlyData.map(hour => `
        <div class="hourly-forecast-item">
            <div>${new Date(hour.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" width="50">
            <div>${hour.temp_c}°C</div>
        </div>
    `).join('');
}

function handleError(error) {
    elements.errorMessage.textContent = error.message || 'Unable to fetch weather data';
    
    // Reset weather info and additional info
    elements.weatherInfo.innerHTML = '<p class="placeholder-text">Search for a location to view weather details</p>';
    Object.values(elements.additionalInfo).forEach(el => el.textContent = '-');
    elements.hourlyForecast.innerHTML = '';
}

// Event Listeners
function initEventListeners() {
    // Search functionality
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

    // Location suggestions
    const debouncedSuggestions = debounce((query) => {
        if (query.length > 2) {
            fetchLocationSuggestions(query);
        } else {
            elements.locationSuggestions.style.display = 'none';
        }
    }, 300);

    elements.locationInput.addEventListener('input', (e) => {
        debouncedSuggestions(e.target.value);
    });

    // Geolocation
    elements.geolocationBtn.addEventListener('click', getUserLocation);

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.locationSuggestions.contains(e.target) && 
            e.target !== elements.locationInput) {
            elements.locationSuggestions.style.display = 'none';
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