const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_key = "ff0c94e8259c8e9a8f87af42a89d4a0c";

const createWeathercard = (cityName, weatherItem, index) => {
    if (index === 0) {
        //HTML for main card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C </h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
                </div>
                <div class="icon">
                    <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Warther rain">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        //HTML for 5 days forecast
        return `<li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png"  alt="weather-rain">
        <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C </h4>
        <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            //Filter the forecasts to get only forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            //Clearing previous weather data
            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";
            currentWeatherDiv.innerHTML = "";

            //Creating weather cards and adding them to
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeathercard(cityName, weatherItem, index));
                }
                else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeathercard(cityName, weatherItem, index));

                }
            });
        })
        .catch(() => {
            alert("An Error Occurred While Fetching the Weather Forecast!");
        });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // Removes white spaces from the city name
    if (!cityName) return; // Return if city name is empty

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No Coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An Error Occurred While Fetching the Coordinates!");
        });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude , longitude} = position.coords;
            const REVERSE_GEOCODING_URL =`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            
            fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                const { name } = data[0];
                getWeatherDetails(name,latitude,longitude);
                //console.log(data);
            })
            .catch(() => {
                alert("An Error Occurred While Fetching the City!");
            });
        
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation Request Denied !")
            }

        }
    )
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e=>e.key === "Enter" && getCityCoordinates());
