const API_KEY = '';
const CITY = 'Moscow';

const CUSTOM_MONTHS_GENITIVE = [
    "Сечня",
    "Лютого",
    "Березня",
    "Цветня",
    "Травня",
    "Червня",
    "Липня",
    "Серпня",
    "Вересня",
    "Жовтня",
    "Листопада",
    "Грудня"
];
const CUSTOM_WEEKDAYS = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота"
];

function getWindDirection(deg) {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(deg / 45) % 8];
}

function getWindDesc(speed) {
    if (speed < 0.5) return 'Штиль';
    if (speed < 3.3) return 'Лёгкий бриз';
    if (speed < 8.0) return 'Умеренный ветер';
    return 'Сильный ветер';
}

function isNightByTime(dt, sunrise, sunset) {
    return dt < sunrise || dt > sunset;
}

function getIconPath(weatherId, isNight) {
    const folder = isNight ? 'night' : 'day';
    const suffix = isNight ? '-night' : '-day';

    if (weatherId === 800)
        return `img/${folder}/clear${suffix}.svg`;

    if (weatherId === 801 || weatherId === 802)
        return `img/${folder}/partly-cloudy${suffix}.svg`;

    if (weatherId === 803 || weatherId === 804)
        return `img/${folder}/overcast${suffix}.svg`;

    if (weatherId >= 500 && weatherId <= 531)
        return `img/${folder}/partly-cloudy${suffix}-rain.svg`;

    if (weatherId >= 600 && weatherId <= 622)
        return `img/${folder}/partly-cloudy${suffix}-snow.svg`;

    if (weatherId >= 200 && weatherId <= 232)
        return `img/${folder}/thunderstorms${suffix}.svg`;

    if (weatherId === 701 || weatherId === 741)
        return `img/${folder}/fog${suffix}.svg`;

    return `img/general/cloudy.svg`;
}

async function getWeather() {
    try {
        const resp = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&lang=ru&appid=${API_KEY}`
        );

        const data = await resp.json();
        const cur = data.list[0];

        const sunrise = data.city.sunrise;
        const sunset = data.city.sunset;
        
        function formatDateCustom(date = new Date()) {
            const weekday = CUSTOM_WEEKDAYS[date.getDay()];
            const day = date.getDate();
            const month = CUSTOM_MONTHS_GENITIVE[date.getMonth()];

            return `${weekday}, ${day} ${month}`;
        }

        const now = new Date();
        document.getElementById('current-date').innerText =
            formatDateCustom(new Date());

        const isNightNow = isNightByTime(cur.dt, sunrise, sunset);

        document.getElementById('city').innerText = data.city.name;
        document.getElementById('temp').innerText = Math.round(cur.main.temp);
        document.getElementById('feels-like').innerText = Math.round(cur.main.feels_like);
        document.getElementById('description').innerText = cur.weather[0].description;
        document.getElementById('wind-desc').innerText = getWindDesc(cur.wind.speed);

        document.getElementById('wind-speed').innerText =
            cur.wind.speed.toFixed(1) + ' м/с';
        document.getElementById('wind-dir').innerText =
            getWindDirection(cur.wind.deg);
        document.getElementById('pressure').innerText =
            cur.main.pressure;
        document.getElementById('humidity').innerText =
            cur.main.humidity;
        document.getElementById('visibility').innerText =
            (cur.visibility / 1000).toFixed(1);

        const dewPoint =
            Math.round(cur.main.temp - ((100 - cur.main.humidity) / 5));
        document.getElementById('dew-point').innerText = dewPoint;

        document.getElementById('current-icon').src =
            getIconPath(cur.weather[0].id, isNightNow);

        const forecastContainer = document.getElementById('forecast');
        forecastContainer.innerHTML = '';

        for (let i = 1; i <= 4; i++) {
            const item = data.list[i];
            const hour = new Date(item.dt * 1000).getHours();
            const isNight = isNightByTime(item.dt, sunrise, sunset);

            forecastContainer.innerHTML += `
                <div class="forecast-item">
                    <div class="f-time">${hour}:00</div>
                    <img src="${getIconPath(item.weather[0].id, isNight)}" class="f-icon">
                    <div class="f-temp">${Math.round(item.main.temp)}°</div>
                </div>
            `;
        }

    } catch (e) {
        console.error('API Error:', e);
    }
}

getWeather();
setInterval(getWeather, 1800000);
