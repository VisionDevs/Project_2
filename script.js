// ===== WEATHER DASHBOARD APP =====
class WeatherApp {
    constructor() {
        this.apiKey = '4c8779d698b6a232476a79dc32c50457';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.unit = localStorage.getItem('skypulse-unit') || 'metric';
        this.recentSearches = JSON.parse(localStorage.getItem('skypulse-recent')) || [];

        this.initElements();
        this.initEventListeners();
        this.updateUnitDisplay();
        this.renderRecentSearches();
        this.loadLastCity();
    }

    // ===== INITIALIZATION =====
    initElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.suggestions = document.getElementById('suggestions');
        this.locationBtn = document.getElementById('locationBtn');
        this.unitToggle = document.getElementById('unitToggle');
        this.loading = document.getElementById('loading');
        this.errorState = document.getElementById('errorState');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherContent = document.getElementById('weatherContent');
        this.recentContainer = document.getElementById('recentSearches');

        // Weather elements
        this.cityNameEl = document.getElementById('cityName');
        this.currentDateEl = document.getElementById('currentDate');
        this.tempValueEl = document.getElementById('tempValue');
        this.weatherDescEl = document.getElementById('weatherDesc');
        this.feelsLikeEl = document.getElementById('feelsLike');
        this.weatherIconEl = document.getElementById('weatherIcon');
        this.humidityEl = document.getElementById('humidity');
        this.windSpeedEl = document.getElementById('windSpeed');
        this.visibilityEl = document.getElementById('visibility');
        this.pressureEl = document.getElementById('pressure');
        this.sunriseEl = document.getElementById('sunrise');
        this.sunsetEl = document.getElementById('sunset');
        this.forecastGrid = document.getElementById('forecastGrid');
    }

    initEventListeners() {
        // Search
        this.searchBtn.addEventListener('click', () => this.searchCity());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });

        // Suggestions
        let debounceTimer;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = this.searchInput.value.trim();
            if (query.length >= 2) {
                debounceTimer = setTimeout(() => this.fetchSuggestions(query), 300);
            } else {
                this.hideSuggestions();
            }
        });

        // Close suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-section')) {
                this.hideSuggestions();
            }
        });

        // Location
        this.locationBtn.addEventListener('click', () => this.getLocationWeather());

        // Unit toggle
        this.unitToggle.addEventListener('click', () => this.toggleUnit());
    }

    // ===== SEARCH =====
    searchCity() {
        const city = this.searchInput.value.trim();
        if (!city) return;
        this.fetchWeather(city);
        this.hideSuggestions();
    }

    async fetchSuggestions(query) {
        try {
            const url = `${this.baseUrl}/find?q=${encodeURIComponent(query)}&type=like&cnt=5&appid=${this.apiKey}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.list && data.list.length > 0) {
                this.showSuggestions(data.list);
            } else {
                this.hideSuggestions();
            }
        } catch {
            this.hideSuggestions();
        }
    }

    showSuggestions(cities) {
        this.suggestions.innerHTML = cities.map(city => 
            `<li data-city="${city.name}" data-country="${city.sys.country}">
                <i class="fas fa-location-dot"></i>
                ${city.name}, ${city.sys.country}
            </li>`
        ).join('');

        this.suggestions.classList.add('show');

        this.suggestions.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const city = li.dataset.city;
                this.searchInput.value = `${city}, ${li.dataset.country}`;
                this.fetchWeather(city);
                this.hideSuggestions();
            });
        });
    }

    hideSuggestions() {
        this.suggestions.classList.remove('show');
    }

    // ===== FETCH WEATHER =====
    async fetchWeather(city) {
        this.showLoading();
        this.hideError();
        this.hideContent();

        try {
            // Current weather
            const currentUrl = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=${this.unit}&appid=${this.apiKey}`;
            const currentRes = await fetch(currentUrl);
            const currentData = await currentRes.json();

            if (currentData.cod !== 200) {
                throw new Error(currentData.message || 'City not found');
            }

            // 5-day forecast
            const forecastUrl = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&units=${this.unit}&appid=${this.apiKey}`;
            const forecastRes = await fetch(forecastUrl);
            const forecastData = await forecastRes.json();

            this.hideLoading();
            this.renderCurrentWeather(currentData);
            this.renderForecast(forecastData);
            this.showContent();
            this.addRecentSearch(currentData.name);
            this.setWeatherBackground(currentData.weather[0].main.toLowerCase());
            
            localStorage.setItem('skypulse-lastCity', city);

        } catch (error) {
            this.hideLoading();
            this.showError(error.message || 'Failed to fetch weather data');
        }
    }

    async fetchWeatherByCoords(lat, lon) {
        this.showLoading();
        this.hideError();
        this.hideContent();

        try {
            const currentUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&units=${this.unit}&appid=${this.apiKey}`;
            const currentRes = await fetch(currentUrl);
            const currentData = await currentRes.json();

            const forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&units=${this.unit}&appid=${this.apiKey}`;
            const forecastRes = await fetch(forecastUrl);
            const forecastData = await forecastRes.json();

            this.hideLoading();
            this.renderCurrentWeather(currentData);
            this.renderForecast(forecastData);
            this.showContent();
            this.addRecentSearch(currentData.name);
            this.setWeatherBackground(currentData.weather[0].main.toLowerCase());
            
            this.searchInput.value = currentData.name;
            localStorage.setItem('skypulse-lastCity', currentData.name);

        } catch (error) {
            this.hideLoading();
            this.showError('Failed to fetch weather data');
        }
    }

    // ===== GEOLOCATION =====
    getLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Geolocation not supported by your browser');
            return;
        }

        this.locationBtn.querySelector('i').className = 'fas fa-spinner fa-spin';

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.locationBtn.querySelector('i').className = 'fas fa-location-crosshairs';
                this.fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                this.locationBtn.querySelector('i').className = 'fas fa-location-crosshairs';
                this.showError('Location access denied');
            }
        );
    }

    // ===== RENDER =====
    renderCurrentWeather(data) {
        this.cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        this.currentDateEl.textContent = this.formatDate(new Date());
        this.tempValueEl.textContent = Math.round(data.main.temp);
        this.weatherDescEl.textContent = data.weather[0].description;
        this.feelsLikeEl.textContent = Math.round(data.main.feels_like);
        this.weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        this.weatherIconEl.alt = data.weather[0].description;
        
        this.humidityEl.textContent = `${data.main.humidity}%`;
        this.windSpeedEl.textContent = this.unit === 'metric' 
            ? `${Math.round(data.wind.speed * 3.6)} km/h`
            : `${Math.round(data.wind.speed)} mph`;
        this.visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        this.pressureEl.textContent = `${data.main.pressure} hPa`;
        this.sunriseEl.textContent = this.formatTime(data.sys.sunrise, data.timezone);
        this.sunsetEl.textContent = this.formatTime(data.sys.sunset, data.timezone);
    }

    renderForecast(data) {
        // Get one forecast per day (noon readings)
        const daily = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
            if (!daily[date] || Math.abs(hour - 12) < Math.abs(parseInt(daily[date].dt_txt.split(' ')[1]) - 12)) {
                daily[date] = item;
            }
        });

        const forecasts = Object.values(daily).slice(1, 6); // Skip today

        this.forecastGrid.innerHTML = forecasts.map(day => `
            <div class="forecast-card">
                <div class="forecast-day">${this.formatDay(day.dt_txt)}</div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                </div>
                <div class="forecast-temp">
                    <span class="forecast-high">${Math.round(day.main.temp_max)}°</span>
                    <span class="forecast-low">${Math.round(day.main.temp_min)}°</span>
                </div>
            </div>
        `).join('');
    }

    // ===== UNITS =====
    toggleUnit() {
        this.unit = this.unit === 'metric' ? 'imperial' : 'metric';
        localStorage.setItem('skypulse-unit', this.unit);
        this.updateUnitDisplay();
        
        // Refresh data if we have a city
        const lastCity = localStorage.getItem('skypulse-lastCity');
        if (lastCity) {
            this.fetchWeather(lastCity);
        }
    }

    updateUnitDisplay() {
        this.unitToggle.textContent = this.unit === 'metric' ? '°C' : '°F';
    }

    // ===== RECENT SEARCHES =====
    addRecentSearch(city) {
        this.recentSearches = this.recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase());
        this.recentSearches.unshift(city);
        this.recentSearches = this.recentSearches.slice(0, 5);
        localStorage.setItem('skypulse-recent', JSON.stringify(this.recentSearches));
        this.renderRecentSearches();
    }

    renderRecentSearches() {
        if (this.recentSearches.length === 0) {
            this.recentContainer.innerHTML = '';
            return;
        }

        this.recentContainer.innerHTML = this.recentSearches.map(city => 
            `<button class="recent-chip" data-city="${city}">
                <i class="fas fa-clock-rotate-left"></i>
                ${city}
            </button>`
        ).join('');

        this.recentContainer.querySelectorAll('.recent-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const city = chip.dataset.city;
                this.searchInput.value = city;
                this.fetchWeather(city);
            });
        });
    }

    // ===== BACKGROUND =====
    setWeatherBackground(condition) {
        const weatherMap = {
            'clear': 'clear',
            'clouds': 'clouds',
            'rain': 'rain',
            'drizzle': 'drizzle',
            'thunderstorm': 'thunderstorm',
            'snow': 'snow',
            'mist': 'mist',
            'haze': 'haze',
            'fog': 'fog',
            'smoke': 'mist',
            'dust': 'mist'
        };
        document.body.dataset.weather = weatherMap[condition] || 'clear';
    }

    // ===== HELPERS =====
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    }

    formatDay(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    formatTime(timestamp, timezoneOffset) {
        const date = new Date((timestamp + timezoneOffset) * 1000);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' 
        });
    }

    // ===== STATE MANAGEMENT =====
    showLoading() { this.loading.classList.add('show'); }
    hideLoading() { this.loading.classList.remove('show'); }
    showContent() { this.weatherContent.classList.add('show'); }
    hideContent() { this.weatherContent.classList.remove('show'); }
    
    showError(msg) {
        this.errorMessage.textContent = msg;
        this.errorState.classList.add('show');
    }
    hideError() { this.errorState.classList.remove('show'); }

    loadLastCity() {
        const lastCity = localStorage.getItem('skypulse-lastCity');
        if (lastCity) {
            this.searchInput.value = lastCity;
            this.fetchWeather(lastCity);
        }
    }
}

// Initialize
const app = new WeatherApp();
