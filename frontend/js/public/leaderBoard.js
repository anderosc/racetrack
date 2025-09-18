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
    renderLeaderBoard(drivers);
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
    renderMiniFlag(state)

    if (currentRace?.isStarted && !currentRace.isEnded) {
        socket.emit('leaderboard:request');
    }

});

function renderLeaderBoard(drivers) {
    const container = document.getElementById("leaderBoard");
    container.innerHTML = ''; // clear previous content

    const raceName = currentRace.sessionName;
    leaderboardDiv.innerHTML = `
    <div class="session-header">
        <h2>Race Session: ${raceName.toUpperCase()}</h2>
        <hr class="session-divider">
    </div>
    `;


    const driverKeys = Object.keys(drivers);
    if (driverKeys.length === 0) {
        leaderboardDiv.innerHTML += '<p>No race data yet.</p>';
        return;
    }
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-wrapper';

    const table = document.createElement("table");
    table.id = "leaderboardTable";

    // header row
    const headerRow = document.createElement("tr");
    ['Position', 'Driver', 'Car', 'Current Lap', 'Fastest Lap'].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // sort drivers by lap times
    const sortedDrivers = driverKeys.sort((a, b) => {
        const fastestA = drivers[a].lapTimes.length ? Math.min(...drivers[a].lapTimes) : Infinity;
        const fastestB = drivers[b].lapTimes.length ? Math.min(...drivers[b].lapTimes) : Infinity;
        return fastestA - fastestB;
    });

    sortedDrivers.forEach((driverId, index) => {
        const driver = drivers[driverId];
        const fastestLap = driver.lapTimes.length
            ? formatLapTime(Math.min(...driver.lapTimes))
            : '-';

        const currentLap = driver.lapsCompleted + 1;

        const driverName = currentRace.drivers.find(d => d.carNumber === parseInt(driverId))?.name || `Car ${driverId}` ;
        const formattedName = driverName.charAt(0).toUpperCase() + driverName.slice(1);

        const row = document.createElement("tr");
        const position = index + 1;
        [position, formattedName, driverId, currentLap, fastestLap].forEach(text => {
            const td = document.createElement("td");
            td.textContent = text;
            row.appendChild(td);
        });
        table.appendChild(row);
    });

    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// mini flag under leaderboard
function renderMiniFlag(state) {
    const flag = document.getElementById("miniFlag");
    const label = document.getElementById("flagLabel");

    if (!state.currentRace) return;

    flag.innerHTML = "";
    flag.className = "flag";

    const mode = state.currentRace.raceMode?.toLowerCase();
    if (mode) {
        flag.classList.add(mode);
        label.innerText = `Flag: ${state.currentRace.raceMode}`;
    } else {
        label.innerText = "Flag: --";
    }

    // checkered flag for finish
    if (mode === "finish") {
        flag.style.display = "grid";
        flag.style.gridTemplateColumns = "repeat(4, 1fr)";
        flag.style.gridTemplateRows = "repeat(4, 1fr)";
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const square = document.createElement("div");
                square.style.width = "100%";
                square.style.height = "100%";
                square.style.backgroundColor = (i + j) % 2 === 0 ? "white" : "black";
                flag.appendChild(square);
            }
        }
    } else {
        flag.style.display = "block"; // reset for solid color flags
    }
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
