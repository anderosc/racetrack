

let activeDrivers = {};
let lastRaceName = null;

export function handleLapTracking(io, socket, raceTrackState) {

    // reset drivers when new race starts or leaderboard request update
    function ensureActiveDriversReset() {
        const currentRace = raceTrackState.currentRace;
        if (!currentRace) return;

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

    socket.on('state:update', () => {
        ensureActiveDriversReset();
    });


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

    socket.on('leaderboard:request', () => {
        ensureActiveDriversReset();
        socket.emit('leaderboard:update', activeDrivers);
    })
}