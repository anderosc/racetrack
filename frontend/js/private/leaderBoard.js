const socket = io();

// DOM
const leaderboardDiv = document.getElementById("leaderBoard");
const timerElement = document.getElementById("race-timer");

// ensure flag status elements exist
let flagStatusElement = document.getElementById("flag-status");
if (!flagStatusElement) {
    flagStatusElement = document.createElement('p');
    flagStatusElement.id = "flag-status";
    leaderboardDiv.insertAdjacentElement("afterend", flagStatusElement);
}

let lastRaceDrivers = {};
let currentRace = null;

// listen for leaderboard updates
socket.on('leaderboard:update', (drivers) => {
    lastRaceDrivers = JSON.parse(JSON.stringify(drivers)); // deep copy for freeze
    if (currentRace && currentRace.raceMode !== "Finish") {
        // only update if race is active
        renderLeaderBoard(drivers);
    }
});

socket.on('state:update', (state) => {
    currentRace = state.currentRace;

    if (currentRace && currentRace.durationSeconds != null) {
        const minutes = Math.floor(currentRace.durationSeconds / 60);
        const seconds = currentRace.durationSeconds % 60;
        timerElement.innerText = `Time remaining: ${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
        timerElement.innerText = "Time remaining: --:--";
    }

    // update flag
    if (currentRace && currentRace.raceMode) {
        switch (currentRace.raceMode) {
            case "Safe": flagStatusElement.innerText = "Flag: Green (Safe)"; break;
            case "Hazard": flagStatusElement.innerText = "Flag: Yellow (Hazard)"; break;
            case "Danger": flagStatusElement.innerText = "Flag: Red (Danger)"; break;
            case "Finish": flagStatusElement.innerText = "Flag: Checkered (Finish)"; break;
            default: flagStatusElement.innerText = `Flag: ${currentRace.raceMode}`;
        }
    } else {
        flagStatusElement.innerText = "Flag: --"
    }

    // update leaderboard
    if (!currentRace || !currentRace.drivers || currentRace.drivers.length === 0) {
        renderLeaderBoard({});
        return;
    }
    if (currentRace.raceMode === "Finish") {
        renderLeaderBoard(lastRaceDrivers);
    } else {
        renderLeaderBoard(lastRaceDrivers);
    }
});

function renderLeaderBoard(drivers) {
    const raceName = currentRace.sessionName;
    leaderboardDiv.innerHTML = `<h2>Session name: ${raceName}</h2>`;

    const driverKeys = Object.keys(drivers);

    if (driverKeys.length === 0) {
        leaderboardDiv.innerHTML += '<p>No race data yet.</p>';
        return;
    }

    const ul = document.createElement('ul');

    // sort drivers by lap times
    const sortedDrivers = driverKeys.sort((a, b) => {
        const fastestA = drivers[a].lapTimes.length ? Math.min(...drivers[a].lapTimes) : Infinity;
        const fastestB = drivers[b].lapTimes.length ? Math.min(...drivers[b].lapTimes) : Infinity;
        return fastestA - fastestB;
    });

    sortedDrivers.forEach(driverId => {
        const driver = drivers[driverId];
        const fastestLap = driver.lapTimes.length
            ? formatLapTime(Math.min(...driver.lapTimes))
            : '-';

        const li = document.createElement('li');
        const currentLap = driver.lapsCompleted + 1;
        li.textContent = `Car ${driverId} - Current lap: ${currentLap}, Fastest Lap: ${fastestLap}`;
        ul.appendChild(li);
    });

    leaderboardDiv.appendChild(ul);
}

function formatLapTime(ms) {
    if (!ms || ms <= 0) return "-";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

socket.emit('race:requestState');
socket.emit('leaderboard:request');
