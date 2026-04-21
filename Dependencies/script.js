// DOM Elements
const timeDisplay = document.getElementById('time');
const dateDisplay = document.getElementById('date');
const toggleBtn = document.getElementById('toggleBtn');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const toggleText = document.getElementById('toggleText');
const errorToast = document.getElementById('errorMessage');
const iconMoon = document.querySelector('.icon-moon');
const iconSun = document.querySelector('.icon-sun');

// State
let wakeLock = null;
let isLocked = false;

// Initialize App
function init() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Setup event listeners
    toggleBtn.addEventListener('click', handleToggle);
    
    // Handle visibility changes (browser tab switching)
    document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    });

    // Check API support
    if (!('wakeLock' in navigator)) {
        showError("Your browser doesn't support the Wake Lock API.");
        toggleBtn.disabled = true;
        toggleBtn.style.opacity = '0.5';
        toggleBtn.style.cursor = 'not-allowed';
    }
}

// Clock Functionality
function updateClock() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString(undefined, options);
}

// Wake Lock Functionality
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        isLocked = true;
        
        wakeLock.addEventListener('release', () => {
            // When automatically released (e.g. minified)
            if (isLocked) { // We didn't release it manually
                // It will be re-acquired on visibility change
            }
        });
        
        updateUI();
    } catch (err) {
        showError(`${err.name}: ${err.message}`);
    }
}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        await wakeLock.release();
        wakeLock = null;
        isLocked = false;
        updateUI();
    }
}

function handleToggle() {
    if (isLocked) {
        releaseWakeLock();
    } else {
        requestWakeLock();
    }
}

// UI Updates
function updateUI() {
    if (isLocked) {
        // Active State
        statusBadge.classList.add('active');
        statusText.textContent = "Screen awake";
        toggleBtn.classList.add('active');
        toggleText.textContent = "Disable Wake Lock";
        iconMoon.style.display = 'none';
        iconSun.style.display = 'block';
    } else {
        // Inactive State
        statusBadge.classList.remove('active');
        statusText.textContent = "Screen can sleep";
        toggleBtn.classList.remove('active');
        toggleText.textContent = "Enable Wake Lock";
        iconMoon.style.display = 'block';
        iconSun.style.display = 'none';
    }
}

function showError(message) {
    errorToast.textContent = message;
    errorToast.style.display = 'block';
    
    // Reflow
    errorToast.offsetHeight;
    
    errorToast.classList.add('show');
    
    setTimeout(() => {
        errorToast.classList.remove('show');
        setTimeout(() => {
            errorToast.style.display = 'none';
        }, 400); // Wait for transition
    }, 4000);
}

// Start
init();
