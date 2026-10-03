const historyArray = [];

if (localStorage.getItem('cities')) {
    const savedCities = JSON.parse(localStorage.getItem('cities'));
    historyArray.push(...savedCities);
    showHistory();
}

function getWeather() {
    const city = document.getElementById('cityInput').value;
    
    if (city == "") {
        alert("Ты забыл ввести город!");
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('weatherBlock').style.display = 'none';

    fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + city + '&count=1&language=ru')
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        console.log("Данные города:", data);
        
        if (!data.results) {
            alert("Такой город не найден, попробуй другой!");
            document.getElementById('loading').style.display = 'none';
            return;
        }

        const lat = data.results[0].latitude;
        const lon = data.results[0].longitude;
        const realCityName = data.results[0].name;

        const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + 
                     '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m' + 
                     '&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto';

        fetch(apiUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(weatherData) {
            console.log("Полная погода:", weatherData);

            const current = weatherData.current;

            document.getElementById('cityName').innerText = realCityName;
            document.getElementById('temp').innerText = Math.round(current.temperature_2m) + '°C';
            document.getElementById('feelsLike').innerText = 'Ощущается как: ' + Math.round(current.apparent_temperature) + '°C';
            document.getElementById('humidity').innerText = current.relative_humidity_2m + '%';
            document.getElementById('wind').innerText = Math.round(current.wind_speed_10m) + ' км/ч';

            const deg = current.wind_direction_10m;
            const dirText = (deg > 292 || deg <= 22) ? "СВ" :
                           (deg > 22 && deg <= 67) ? "СВ" :
                           (deg > 67 && deg <= 112) ? "В" :
                           (deg > 112 && deg <= 157) ? "ЮВ" :
                           (deg > 157 && deg <= 202) ? "Ю" :
                           (deg > 202 && deg <= 247) ? "ЮЗ" :
                           (deg > 247 && deg <= 292) ? "З" : "СЗ";
            
            document.getElementById('windDir').innerText = dirText + ' (' + deg + '°)';

            const pressureMm = Math.round(current.surface_pressure * 0.750062);
            document.getElementById('pressure').innerText = pressureMm + ' мм';

            const code = current.weather_code;
            const textWeather = (code == 0) ? "☀️ Ясно" :
                               (code >= 1 && code <= 3) ? "☁️ Облачно" :
                               (code >= 45 && code <= 48) ? "🌫 Туман" :
                               (code >= 51 && code <= 67) ? "🌧 Дождь" :
                               (code >= 71 && code <= 77) ? "❄️ Снег" :
                               (code >= 95) ? "🌩 Гроза" : "Хорошая погода";
            
            document.getElementById('desc').innerText = textWeather;

            const forecastCards = [];
            for (let i = 1; i <= 5; i++) {
                const maxT = Math.round(weatherData.daily.temperature_2m_max[i]);
                const minT = Math.round(weatherData.daily.temperature_2m_min[i]);
                
                forecastCards.push(
                    '<div class="day-card">' +
                    '<b>День ' + i + '</b><br>' +
                    maxT + '°<br>' +
                    '<small style="color:#777">' + minT + '°</small>' +
                    '</div>'
                );
            }
            document.getElementById('forecast').innerHTML = forecastCards.join('');

            document.getElementById('loading').style.display = 'none';
            document.getElementById('weatherBlock').style.display = 'block';

            saveCity(realCityName);
        });
    })
    .catch(function(err) {
        alert("Какая-то ошибка с интернетом или сервером!");
        console.log(err);
        document.getElementById('loading').style.display = 'none';
    });
}

function saveCity(cityName) {
    if (historyArray.indexOf(cityName) == -1) {
        historyArray.push(cityName);
        if (historyArray.length > 5) {
            historyArray.shift();
        }
        localStorage.setItem('cities', JSON.stringify(historyArray));
        showHistory();
    }
}

function showHistory() {
    const htmlParts = [];
    for (let i = 0; i < historyArray.length; i++) {
        htmlParts.push('<span onclick="searchFromHistory(\'' + historyArray[i] + '\')">' + historyArray[i] + '</span>');
    }
    document.getElementById('historyDiv').innerHTML = htmlParts.join('');
}

function searchFromHistory(city) {
    document.getElementById('cityInput').value = city;
    getWeather();
}
