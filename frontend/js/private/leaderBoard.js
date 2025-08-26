const socket = io();

// leaderboard container
const leaderboardDiv = document.getElementById("leaderBoard");

// listen for leaderboard updates
socket.on('leaderboard:update', (drivers) => {
    // clear previous leaderboard
    leaderboardDiv.innerHTML = '<h2>Leaderboard</h2>';

    const driverKeys = Object.keys(drivers);

    if (driverKeys.length === 0) {
        leaderboardDiv.innerHTML += '<p>There are no active races at the moment.</p>';
        return;
    }

    const ul = document.createElement('ul');

    driverKeys.forEach(driverId => {
        const driver = drivers[driverId];
        const fastestLap = driver.lapTimes.length
            ? Math.min(...driver.lapTimes)
            : '-';

        const li = document.createElement('li');
        li.textContent = `Car ${driverId} - Laps: ${driver.lapsCompleted}, Fastest Lap: ${fastestLap}ms`;
        ul.appendChild(li);
    });

    leaderboardDiv.appendChild(ul);
});
