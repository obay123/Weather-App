const apiKey = '0268b42a2b304542a02194048242305';
const searchBtn = document.getElementById('search-btn');
const countryInput = document.getElementById('country-input');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');

searchBtn.addEventListener('click', () => {
    const country = countryInput.value.trim();
    
    if (!country) {
        errorMessage.textContent = 'Please enter a country name';
        weatherInfo.innerHTML = '<p>Enter a country name to get weather information</p>';
        return;
    }

    // Clear previous error and start loading
    errorMessage.textContent = '';
    weatherInfo.innerHTML = '<p>Loading weather data...</p>';

    // Fetch weather data
    fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${country}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not found');
            }
            return response.json();
        })
        .then(data => {
            // Extract relevant weather information
            const location = data.location;
            const current = data.current;

            // Update weather info display
            weatherInfo.innerHTML = `
                <h2>${location.name}, ${location.country}</h2>
                <p>Temperature: ${current.temp_c}°C / ${current.temp_f}°F</p>
                <p>Condition: ${current.condition.text}</p>
                <img src="https:${current.condition.icon}" alt="Weather Icon">
                <p>Humidity: ${current.humidity}%</p>
                <p>Wind: ${current.wind_kph} km/h ${current.wind_dir}</p>
            `;
        })
        .catch(error => {
            // Handle errors
            errorMessage.textContent = 'Unable to fetch weather data. Please check the country name.';
            weatherInfo.innerHTML = '<p>Enter a country name to get weather information</p>';
        });
});

// Allow searching by pressing Enter key
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});