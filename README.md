# SkyPulse — Weather Dashboard

A modern, responsive weather dashboard with real-time data, 5-day forecasts, geolocation, and dynamic weather-based backgrounds. Built with vanilla JavaScript and the OpenWeatherMap API.

## Features

- **Real-Time Weather** — Current temperature, description, feels-like, humidity, wind, pressure, visibility
- **5-Day Forecast** — Daily forecasts with high/low temps and weather icons
- **City Search** — Autocomplete suggestions as you type
- **Geolocation** — One-click weather for your current location
- **Unit Toggle** — Switch between Celsius and Fahrenheit
- **Recent Searches** — Quick access to previously searched cities
- **Dynamic Backgrounds** — Background gradients change based on weather conditions
- **Sunrise/Sunset** — Timezone-aware sunrise and sunset times
- **Responsive Design** — Optimised for mobile, tablet, and desktop
- **Persistent State** — Last searched city loads automatically
- **Loading & Error States** — Clean UX for all scenarios

## Tech Stack

- HTML5 (Semantic)
- CSS3 (Custom Properties, Grid, Flexbox, Animations, Backdrop-filter)
- JavaScript ES6+ (Classes, Async/Await, Fetch API, Geolocation API)
- OpenWeatherMap API (Current Weather + 5-Day Forecast)
- Font Awesome Icons
- Google Fonts (Inter)

## Architecture

OOP class-based design (`WeatherApp`) with:
- Clean separation of data fetching, rendering, and state management
- Debounced search input for API efficiency
- XSS-safe rendering
- Graceful error handling with user feedback

## Live Demo

[https://visiondevs.github.io/Project_2/](https://visiondevs.github.io/Project_2/)

## Author

**Rotondwa Vision Mavhungu**  
Junior Software Developer at Hollard Insurance  
[Portfolio](https://visiondevs.github.io/Rotondwa-Portfolio/) | [GitHub](https://github.com/VisionDevs)
