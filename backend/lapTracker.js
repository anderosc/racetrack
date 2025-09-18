

let activeDrivers = {};
let lastRaceName = null;

export function handleLapTracking(io, socket, raceTrackState) {

    // reset drivers when new race starts or leaderboard request update
    function ensureActiveDriversReset() {
        const currentRace = raceTrackState.currentRace;
        if (!currentRace || !currentRace.isStarted || currentRace.isEnded) return;

        if (lastRaceName !== currentRace.sessionName) {
            activeDrivers = {}
            lastRaceName = currentRace.sessionName;

            // initialize all race drivers with 0 laps
            currentRace.drivers.forEach(driver => {
                activeDrivers[driver.carNumber] = {
                    lapsCompleted: 0,
                    lastTime: null,
                    lapTimes: []
                };
            });
            // emit initial empty leaderboard
            io.emit('leaderboard:update', activeDrivers);
        }
    }

    // handle leaderboard updates on race state changes
    socket.on('state:update', () => {
        ensureActiveDriversReset();
        io.emit('leaderboard:update', activeDrivers);
    });

    // handle lap completion
    socket.on('lap:completed', ({driver}) => {
        ensureActiveDriversReset();

        const now = Date.now();
        const record = activeDrivers[driver];

        if (!record) return;

        if (record.lastTime == null) {
            // first click set start time
            record.lastTime = now;
            return;
        }

        const lapTime = now - record.lastTime;
        record.lapTimes.push(lapTime);
        record.lapsCompleted++;
        record.lastTime = now;


        io.emit('lap:completed', {
            driver,
            lap: record.lapsCompleted,
            lapTime
        });
        io.emit('leaderboard:update', activeDrivers);
    });

    function initializeActiveDrivers(currentRace) {
        activeDrivers = {};
        lastRaceName = currentRace.sessionName;

        currentRace.drivers.forEach(driver => {
            activeDrivers[driver.carNumber] = {
                lapsCompleted: 0,
                lastTime: null,
                lapTimes: []
            };
        });

    }

    socket.on('leaderboard:request', () => {
        ensureActiveDriversReset();
        const currentRace = raceTrackState.currentRace;
        if (!currentRace) return;

        if (!activeDrivers || lastRaceName !== currentRace.sessionName) {
            initializeActiveDrivers(currentRace);
        }

        socket.emit('leaderboard:update', activeDrivers);
    });

    socket.on('race:start', () => {
        const currentRace = raceTrackState.currentRace;
        if (!currentRace) return;
        initializeActiveDrivers(currentRace);

        io.emit('leaderboard:update', activeDrivers);
    });

    socket.on('race:finish', () => {
        io.emit('leaderboard:update', activeDrivers); // freeze final leaderboard
    })
}