// --- DOM ELEMENTS ---
const lightningLayer = document.getElementById('lightning-layer');
const rainLayer = document.getElementById('rain-layer');
const statusBadge = document.getElementById('status-badge');
const statusDesc = document.getElementById('status-desc');
const lightningMeter = document.getElementById('lightning-meter');
const lightningVal = document.getElementById('lightning-val');
const windSpeed = document.getElementById('wind-speed');
const rainfall = document.getElementById('rainfall');
const mapOverlay = document.getElementById('map-overlay');
const timeDisplay = document.getElementById('time-display');

// Sounds
const soundAlert = document.getElementById('sound-alert');
const soundAlarm = document.getElementById('sound-alarm');

// Modal
const modal = document.getElementById('alert-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

// Global Variables
let currentLocation = "Angeles City, Pampanga";
let dailyPattern = {}; // Stores the "Storm Scenario" for the day

// =============================================================================
// 1. WEATHER PROFILES & LOCATIONS
// =============================================================================
const WEATHER_PROFILES = {
    'default': { baseTemp: 31, condition: 'cloudy', windBase: 12 },
    'Baguio City, Benguet': { baseTemp: 16, condition: 'rainy', windBase: 20 },
    'Tagaytay City, Cavite': { baseTemp: 24, condition: 'cloudy', windBase: 25 },
    'Manila, Metro Manila': { baseTemp: 33, condition: 'sunny', windBase: 15 },
    'Davao City, Davao del Sur': { baseTemp: 31, condition: 'partly-cloudy', windBase: 10 },
    'Cebu City, Cebu': { baseTemp: 30, condition: 'sunny', windBase: 18 }
};

const phLocations = [
    "Angeles City, Pampanga", "San Fernando, Pampanga", "Mabalacat, Pampanga",
    "Manila, Metro Manila", "Quezon City, Metro Manila", "Baguio City, Benguet",
    "Tagaytay City, Cavite", "Cebu City, Cebu", "Davao City, Davao del Sur"
];

// =============================================================================
// 2. INITIALIZATION
// =============================================================================
window.onload = () => {
    loadLocations();
    generateDailyPattern(); // Generate the "Storm Scenario"
    
    // Set Default Location
    updateLocation("Angeles City, Pampanga");

    // Initialize Slider at Noon
    const slider = document.getElementById('time-slider');
    if(slider) {
        slider.value = 12;
        updateSimulation(12); // Force update immediately
    }
    
    setTimeout(() => {
        const locText = document.getElementById('user-location');
        if(locText) locText.innerText = "📍 Angeles City, Pampanga (Detected)";
    }, 2000);
};

// =============================================================================
// 3. PREDICTIVE NAVIGATION (FIXED)
// =============================================================================
// Generate a random "Storm Time" for the day (e.g., 2 PM)
function generateDailyPattern() {
    const stormPeak = Math.floor(Math.random() * (17 - 14 + 1) + 14); 
    dailyPattern = {
        stormPeak: stormPeak,
        maxWind: Math.floor(Math.random() * (100 - 60) + 60), 
        hasStorm: true 
    };
    console.log("Simulation Generated: Storm hitting at " + stormPeak + ":00");
}

// Called when Slider Moves
function updateSimulation(hour) {
    hour = parseFloat(hour);
    
    // A. Update Clock Display
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = Math.floor(hour > 12 ? hour - 12 : hour);
    const minutes = (hour % 1 === 0) ? '00' : '30';
    const formattedTime = `${displayHour === 0 ? 12 : displayHour}:${minutes} ${ampm}`;
    if(timeDisplay) timeDisplay.innerText = formattedTime;

    // B. Get Base Weather for Current Location
    const profile = WEATHER_PROFILES[currentLocation] || WEATHER_PROFILES['default'];
    
    let currentWind = profile.windBase;
    let currentRain = profile.condition === 'rainy' ? 5 : 0;
    let currentLightning = 0;
    let status = 'clear';

    // C. Apply Storm Algorithm
    // If the slider is close to the "Storm Peak", increase wind/rain
    const distanceToStorm = Math.abs(hour - dailyPattern.stormPeak);

    if (distanceToStorm < 1.5) {
        // Inside the storm window
        const intensity = 1 - (distanceToStorm / 1.5); 
        
        currentWind += (dailyPattern.maxWind * intensity);
        currentRain += (60 * intensity);
        currentLightning = Math.floor(50 * intensity);

        if (intensity > 0.8) status = 'orange';
        else if (intensity > 0.4) status = 'yellow';
    } else {
        // Normal weather fluctuation
        currentWind += Math.sin(hour) * 5; 
    }

    // D. Update the Dashboard UI
    updateMetricsUI(currentWind, currentRain, currentLightning, status);
}

// Update the actual HTML elements
function updateMetricsUI(wind, rain, lightning, status) {
    document.getElementById('wind-speed').innerText = Math.floor(wind) + " km/h";
    document.getElementById('rainfall').innerText = Math.floor(rain) + " mm/h";
    document.getElementById('lightning-val').innerText = lightning + " strikes/min";
    
    if(lightningMeter) lightningMeter.style.width = Math.min(lightning * 2, 100) + '%';
    
    // Only update visuals if we are NOT in manual override mode (optional)
    // For now, slider controls visuals
    if(statusBadge) {
        statusBadge.className = 'status-badge';
        if(lightningMeter) lightningMeter.className = 'meter-fill';
        
        if(status === 'orange') {
            statusBadge.classList.add('orange');
            statusBadge.innerText = "🚨 ORANGE ALERT";
            if(lightningMeter) lightningMeter.style.background = "var(--orange)";
            if(rainLayer) rainLayer.style.opacity = '1';
        } else if (status === 'yellow') {
            statusBadge.classList.add('yellow');
            statusBadge.innerText = "⚠️ YELLOW WARNING";
            if(lightningMeter) lightningMeter.style.background = "var(--yellow)";
            if(rainLayer) rainLayer.style.opacity = '0.5';
        } else {
            statusBadge.classList.add('safe');
            statusBadge.innerText = "🟢 NORMAL";
            if(lightningMeter) lightningMeter.style.background = "var(--safe)";
            if(rainLayer) rainLayer.style.opacity = '0';
        }
    }
}

// =============================================================================
// 4. MANUAL SIMULATION BUTTONS
// =============================================================================
async function setWeather(level) {
    // Reset effects
    lightningLayer.classList.remove('flash-active');
    rainLayer.style.opacity = '0';
    clearMap();

    if (level === 'clear') {
        // Reset to slider's current state
        const slider = document.getElementById('time-slider');
        updateSimulation(slider ? slider.value : 12);
        triggerAlert('🟢 SYSTEM NORMAL', 'Simulation reset.', 'alert');
    } 
    else if (level === 'yellow') {
        rainLayer.style.opacity = '0.5';
        triggerAlert('⚠️ WEATHER ADVISORY', `Yellow Alert in ${currentLocation}.`, 'alert');
        showStormOnMap('yellow');
    } 
    else if (level === 'orange') {
        rainLayer.style.opacity = '1';
        lightningLayer.classList.add('flash-active');
        triggerAlert('🚨 EMERGENCY ALERT', `Orange Alert in ${currentLocation}!`, 'alarm');
        showStormOnMap('orange');
    }
    
    // Send to Backend
    if (level === 'yellow' || level === 'orange') {
        try {
            await fetch('/api/trigger-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level: level, location: currentLocation })
            });
        } catch (err) {
            console.error("Backend Error:", err);
        }
    }
}

// =============================================================================
// 5. LOCATION LOGIC
// =============================================================================
function loadLocations() {
    const select = document.getElementById('location-select');
    select.innerHTML = '<option value="Angeles City, Pampanga">Angeles City, Pampanga</option>';
    phLocations.sort();
    phLocations.forEach(loc => {
        if(loc !== "Angeles City, Pampanga") {
            const option = document.createElement('option');
            option.value = loc;
            option.innerText = loc;
            select.appendChild(option);
        }
    });
}

function updateLocation(newLocation) {
    currentLocation = newLocation;
    const dataSource = document.getElementById('data-source');
    dataSource.innerHTML = "📡 Source: PAGASA (Fetching...)";

    const profile = WEATHER_PROFILES[newLocation] || WEATHER_PROFILES['default'];
    const shortName = newLocation.split(',')[0];

    setTimeout(() => {
        dataSource.innerHTML = `📡 Source: PAGASA (Simulated: ${shortName})`;
        
        // Update Title
        const forecastHeader = document.querySelector('.forecast-card h2');
        if(forecastHeader) forecastHeader.innerText = `📅 7-Day ${shortName} Forecast`;

        // Generate Forecast
        generateForecastCards(profile);

        // Update Slider Context
        // This ensures the live telemetry numbers jump to the new city's baseline immediately
        const slider = document.getElementById('time-slider');
        updateSimulation(slider ? slider.value : 12);

    }, 500);
}

// =============================================================================
// 6. UTILITIES (Forecast, Map, Alerts)
// =============================================================================
function generateForecastCards(profile) {
    const container = document.getElementById('forecast-container');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    let html = '';

    for (let i = 0; i < 7; i++) {
        let day = days[(today + i) % 7];
        let high = profile.baseTemp + Math.floor(Math.random() * 3);
        let low = profile.baseTemp - Math.floor(Math.random() * 4) - 2;
        let icon = profile.baseTemp < 20 ? '🌧️' : (profile.baseTemp > 32 ? '☀️' : '⛅');

        html += `
            <div class="day-card">
                <div style="color:var(--primary); font-weight:bold;">${day}</div>
                <div style="font-size:1.5rem; margin:5px 0;">${icon}</div>
                <div>${high}° / ${low}°</div>
            </div>`;
    }
    container.innerHTML = html;
}

function triggerAlert(title, message, soundType) {
    modalTitle.innerText = title;
    modalMessage.innerText = message;
    modal.classList.remove('hidden');

    if (soundType === 'alert') {
        soundAlert.currentTime = 0;
        soundAlert.play().catch(e => console.log("Audio requires interaction"));
    } else if (soundType === 'alarm') {
        soundAlarm.currentTime = 0;
        soundAlarm.play().catch(e => console.log("Audio requires interaction"));
    }
}

function closeModal() {
    modal.classList.add('hidden');
    soundAlarm.pause();
    soundAlert.pause();
}

function showStormOnMap(color) {
    const storm = document.createElement('div');
    storm.className = 'storm-blob';
    storm.style.background = `radial-gradient(circle, var(--${color}), transparent)`;
    mapOverlay.appendChild(storm);
    setTimeout(() => { storm.style.left = '60%'; }, 100);
}

function clearMap() {
    const blobs = document.querySelectorAll('.storm-blob');
    blobs.forEach(b => b.remove());
}

function handleSubscribe(e) {
    e.preventDefault();
    if (!document.getElementById('privacy-consent').checked) {
        alert("Please consent to the privacy policy.");
        return;
    }
    alert("✅ Subscribed!");
    e.target.reset();
}