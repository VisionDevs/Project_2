const apiKey = "4c8779d698b6a232476a79dc32c50457"; // Replace with your API key

async function getCitySuggestions(query) {
    if (!query) return;  // Avoid empty requests

    const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const suggestions = data.list;

        // Clear any previous suggestions
        const suggestionsList = document.getElementById("suggestions");
        suggestionsList.innerHTML = "";

        if (suggestions) {
            suggestions.forEach(city => {
                const listItem = document.createElement("li");
                listItem.textContent = `${city.name}, ${city.sys.country}`;
                listItem.onclick = () => {
                    document.getElementById("cityInput").value = `${city.name}, ${city.sys.country}`;
                    getWeather(city.name); // Fetch weather for the selected city
                    suggestionsList.innerHTML = ""; // Clear suggestions
                };
                suggestionsList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
    }
}

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 404) {
            alert("City not found. Please try again.");
            return;
        }

        // Update UI with weather data
        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temperature").textContent = `${data.main.temp}°C`;
        document.getElementById("description").textContent = data.weather[0].description;
        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
        document.getElementById("windSpeed").textContent = `Wind Speed: ${data.wind.speed} km/h`;

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Listen for input to show suggestions
document.getElementById("cityInput").addEventListener("input", (event) => {
    getCitySuggestions(event.target.value);
});
