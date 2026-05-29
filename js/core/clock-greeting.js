import {
    updateClock,
    updateDate,
    updateCalendar,
    updateDigitalClock,
    updateGreeting,
    updateWeather
} from '../modules.js';

let activeIntervals = [];

export function destroyWidgets() {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];
}

export function initWidgets(settingsState) {
    destroyWidgets();

    const analogClockPlaceholder = document.getElementById('analog-clock-placeholder');
    const digitalClockPlaceholder = document.getElementById('digital-clock-placeholder');
    const greetingPlaceholder = document.getElementById('greeting-placeholder');
    const weatherWidget = document.getElementById('weather-widget');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherTemp = document.getElementById('weather-temp');
    const datePlaceholder = document.getElementById('date-placeholder');
    const calendarPlaceholder = document.getElementById('calendar-placeholder');

    function tickClock() {
        if (settingsState.clockStyle === 'digital') {
            if (digitalClockPlaceholder) updateDigitalClock(digitalClockPlaceholder);
        } else {
            if (analogClockPlaceholder) updateClock(analogClockPlaceholder);
        }
    }

    if (analogClockPlaceholder && digitalClockPlaceholder) {
        if (settingsState.clockStyle === 'digital') {
            analogClockPlaceholder.style.display = 'none';
            digitalClockPlaceholder.style.display = 'block';
        } else {
            analogClockPlaceholder.style.display = 'block';
            digitalClockPlaceholder.style.display = 'none';
        }
        tickClock();
        activeIntervals.push(setInterval(tickClock, 1000));
    }

    if (greetingPlaceholder) {
        updateGreeting(greetingPlaceholder, settingsState.userName);
        activeIntervals.push(setInterval(() => updateGreeting(greetingPlaceholder, settingsState.userName), 600000));
    }

    if (settingsState.weatherCity && weatherWidget && weatherIcon && weatherTemp) {
        updateWeather(weatherWidget, weatherIcon, weatherTemp, settingsState.weatherCity);
        activeIntervals.push(setInterval(() => updateWeather(weatherWidget, weatherIcon, weatherTemp, settingsState.weatherCity), 1800000));
    }

    if (datePlaceholder) {
        updateDate(datePlaceholder);
        activeIntervals.push(setInterval(() => updateDate(datePlaceholder), 60000));
    }
    if (calendarPlaceholder) {
        updateCalendar(calendarPlaceholder);
        activeIntervals.push(setInterval(() => updateCalendar(calendarPlaceholder), 3600000));
    }

    return { tickClock };
}
