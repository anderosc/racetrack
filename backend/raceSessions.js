import { raceTrackState } from './state.js';

export function raceSessions(io, socket) {

    function isLoggedIn(socket, room) {
        return socket.rooms.has(room);
    }

    // HANDLE Receptionist Server Logic

    socket.on('raceSession:get', (raceSession) => {
        //CHECK FOR AUTHORIZATION
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:create:failure', {error: 'User Is Not Logged into receptionist.'});
            return;
        }
        const sessionNameToFind = raceSession.sessionName.trim().toLowerCase();
        const foundSession = raceTrackState.upComingRaces.find(session => 
            session.sessionName.trim().toLowerCase() === sessionNameToFind
        );
        if (foundSession) {
            socket.emit('raceSession:get:success', foundSession);
        } else {
            socket.emit('raceSession:get:failure', {error: 'Race session not found.'});
        }
    });


    socket.on('raceSession:create', (nextRaceSession) => {
        //CHECK FOR AUTHORIZATION
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:create:failure', {error: 'User is not logged into receptionist.'});
            return;
        }
        //CHECK FOR DUPLICATE SESSION NAME
        const duplicate = raceTrackState.upComingRaces.some(
            session => session.sessionName.toLowerCase() === nextRaceSession.sessionName.toLowerCase()
        );

        if (duplicate) {
            socket.emit('raceSession:create:failure', { error: 'A session with this name already exists.' });
            return;
        }

        raceTrackState.upComingRaces.push(
            {
                sessionName : nextRaceSession.sessionName,
                drivers : [],
                durationSeconds : 30
            }
        )
        io.to('receptionist').emit('raceSession:create:success', nextRaceSession);
    });

    socket.on('raceSession:delete', (raceSession) => {
        //CHECK FOR AUTHORIZATION
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:delete:failure', {error: 'User Is Not Logged into receptionist.'});
            return;
        }
        const sessionNameToDelete = raceSession.sessionName.trim().toLowerCase();
        const wasDeleted = raceTrackState.upComingRaces.some(
            race => race.sessionName.trim().toLowerCase() === sessionNameToDelete
        );

        raceTrackState.upComingRaces = raceTrackState.upComingRaces.filter(
            race => race.sessionName.trim().toLowerCase() !== sessionNameToDelete
        );

        if (wasDeleted) {
            io.to('receptionist').emit('raceSession:delete:success', raceSession);
        } else {
            //console.log(`No matching session found to delete: ${RaceSession.sessionName}`);
        }
    });

    socket.on('raceSession:driver:add', (raceSessionDriver) => {
        //TODO ADD CUSTOM CAR...
        //CHECK FOR AUTHORIZATION
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:driver:add:failure', {error: 'User Is Not Logged into receptionist.'});
            return;
        }
        const sessionName = raceSessionDriver.sessionName.trim().toLowerCase();
        // Find the session from upComingRaces
        const session = raceTrackState.upComingRaces.find(session => session.sessionName.trim().toLowerCase() === sessionName);
        if (!session) {
            console.log(`Session "${sessionName}" not found.`);
            return;
        }

        const isDuplicateDriver = session.drivers.some(
            driver => driver.name.trim().toLowerCase() === raceSessionDriver.driver.name.trim().toLowerCase()
        );

        if (isDuplicateDriver) {
            socket.emit('raceSession:driver:add:failure', { error: 'Driver with this name already exists in the session.' });
            return;
        }

        // Check current car numbers used in this session
        const usedCarNumbers = session.drivers.map(driver => driver.carNumber);
        // Find the first available car number (1 to 8)
        let availableCarNumber = null;
        for (let i = 1; i <= 8; i++) {
            if (!usedCarNumbers.includes(i)) {
                availableCarNumber = i;
                break;
            }
        }
        // If no car numbers available
        if (!availableCarNumber) {
            socket.emit('raceSession:driver:add:failure', {error: 'No available car number.'});
            return;
        }
        // Add the driver to the session
        session.drivers.push({
            name: raceSessionDriver.driver.name.trim(),
            carNumber: availableCarNumber,
            fastestLap: null,
            currentLap: 0
        });
        const raceDriver = {sessionName: sessionName, driverName: raceSessionDriver.driver.name, carNumber: availableCarNumber};
        io.to('receptionist').emit('raceSession:driver:add:success', raceDriver);
    });

}