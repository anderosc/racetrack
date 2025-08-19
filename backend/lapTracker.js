

const drivers = {};

export function handleLapTracking(io, socket) {
    socket.on('lap:completed', (data) => {
        const driver = data.driver;
        const now = Date.now();

        if (!drivers[driver]) {
            drivers[driver] = {
                lapsCompleted: 0,
                lastTime: now,
                lapTimes: []
            };
        }

        let lapTime = null;
        if (drivers[driver].lapsCompleted > 0) {
            lapTime = now - drivers[driver].lastTime;
            drivers[driver].lapTimes.push(lapTime);
        }

        drivers[driver].lapsCompleted++;
        drivers[driver].lastTime = now;

        io.emit('lap:completed', { driver, lap: drivers[driver].lapsCompleted, lapTime });
        io.emit('leaderboard:update', drivers);
    });
}