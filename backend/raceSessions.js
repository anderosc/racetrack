import { raceTrackState } from './state.js';

export function raceSessions(io, socket) {

    function isLoggedIn(socket, room) {
        return socket.rooms.has(room);
    }

    // HANDLE Receptionist Server Logic

    socket.on('raceSession:get', (raceSession) => {
        //AUTHORIZATION
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:create:failure', {error: 'User Is Not Logged in.'});
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
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:create:failure', {error: 'User is not logged in.'});
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
        io.emit("race:update", raceTrackState);
    });

    socket.on('raceSession:delete', (raceSession) => {
        //CHECK FOR AUTHORIZATION
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:delete:failure', {error: 'User Is Not Logged in.'});
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
            io.to('receptionist').emit('raceSession:delete:success', { sessionName: raceSession.sessionName } );
            io.emit("race:update", raceTrackState);
        } else {
            socket.emit('raceSession:delete:failure', {error: 'No matching session found to delete.'} );
        }
    });

    socket.on('raceSession:driver:add', (raceSessionDriver) => {
        // Check authorization
        if (!isLoggedIn(socket, 'receptionist')) {
            socket.emit('raceSession:driver:add:failure', { error: 'User Is Not Logged in.' });
            return;
        }

        const sessionName = raceSessionDriver.sessionName.trim().toLowerCase();
        const requestedCarNumber = raceSessionDriver.driver.carNumber;
        const driverName = raceSessionDriver.driver.name.trim();

        // Find the session
        const session = raceTrackState.upComingRaces.find(
            session => session.sessionName.trim().toLowerCase() === sessionName
        );

        if (!session) {
            socket.emit('raceSession:driver:add:failure', { error: 'Session not found.' });
            return;
        }

        // Check for duplicate driver name
        const isDuplicateDriver = session.drivers.some(
            driver => driver.name.trim().toLowerCase() === driverName.toLowerCase()
        );

        if (isDuplicateDriver) {
            socket.emit('raceSession:driver:add:failure', { error: 'Driver with this name already exists in the session.' });
            return;
        }
        // Get list of already used car numbers
        const usedCarNumbers = session.drivers.map(driver => driver.carNumber);
        let assignedCarNumber = null;
        
        if (requestedCarNumber === 0) {
            for (let i = 1; i <= 8; i++) {
                if (!usedCarNumbers.includes(i)) {
                    assignedCarNumber = i;
                    break;
                }
            }
            if (!assignedCarNumber) {
                socket.emit('raceSession:driver:add:failure', { error: 'No available car numbers.' });
                return;
            }
        } else if (requestedCarNumber >= 1 && requestedCarNumber <= 8) {
            // Check if the requested car number is available
            if (usedCarNumbers.includes(requestedCarNumber)) {
                socket.emit('raceSession:driver:add:failure', { error: `Car number ${requestedCarNumber} is already taken.` });
                return;
            } else {
                assignedCarNumber = requestedCarNumber;
            }

        } else {
            socket.emit('raceSession:driver:add:failure', { error: 'Invalid car number requested. Must be between 1 and 8.' });
            return;
        }

        session.drivers.push({
            name: driverName,
            carNumber: assignedCarNumber,
            fastestLap: null,
            currentLap: 0
        });

        io.to('receptionist').emit('raceSession:driver:add:success', { sessionName: sessionName, driverName: driverName, carNumber: assignedCarNumber });
        io.emit("race:update", raceTrackState);
    });

    socket.on('raceSession:driver:remove', ({ sessionName, driverName }) => {
        if (!isLoggedIn(socket, 'receptionist')) {
            socket.emit('raceSession:driver:remove:failure', { error: 'User is not logged in.' });
            return;
        }

        const trimmedSessionName = sessionName.trim().toLowerCase();
        const trimmedDriverName = driverName.trim().toLowerCase();

        const session = raceTrackState.upComingRaces.find(
            session => session.sessionName.trim().toLowerCase() === trimmedSessionName
        );

        if (!session) {
            socket.emit('raceSession:driver:remove:failure', { error: `Session "${sessionName}" not found.` });
            return;
        }

        const driverIndex = session.drivers.findIndex(
            driver => driver.name.trim().toLowerCase() === trimmedDriverName
        );

        if (driverIndex === -1) {
            socket.emit('raceSession:driver:remove:failure', { error: `Driver "${driverName}" not found in session.` });
            return;
        }

        const removedDriver = session.drivers.splice(driverIndex, 1)[0];

        io.to('receptionist').emit('raceSession:driver:remove:success', { sessionName: session.sessionName, driverName: removedDriver.name, carNumber: removedDriver.carNumber });
        io.emit("race:update", raceTrackState);
    });

    socket.on('raceSession:driver:update', (updateData) => {
        if (!isLoggedIn(socket, 'receptionist')) {
            socket.emit('raceSession:driver:update:failure', { error: 'User is not logged in.' });
            return;
        }
        const sessionName = updateData.sessionName.trim().toLowerCase();
        const driverNameOld = updateData.driverNameOld.trim();
        const driverNameNew = updateData.driverNameNew.trim();
        const requestedCarNumber = parseInt(updateData.carNumber);
        const session = raceTrackState.upComingRaces.find(
            session => session.sessionName.trim().toLowerCase() === sessionName
        );
        if (!session) {
            socket.emit('raceSession:driver:update:failure', { error: 'Session not found.' });
            return;
        }
        const driver = session.drivers.find(
            d => d.name.trim().toLowerCase() === driverNameOld.toLowerCase()
        );
        if (!driver) {
            socket.emit('raceSession:driver:update:failure', { error: 'Original driver not found in session.' });
            return;
        }
        if (
            driverNameNew.toLowerCase() !== driverNameOld.toLowerCase() &&
            session.drivers.some(d => d.name.trim().toLowerCase() === driverNameNew.toLowerCase())
        ) {
            socket.emit('raceSession:driver:update:failure', { error: 'Another driver with the new name already exists.' });
            return;
        }
        const usedCarNumbers = session.drivers
            .filter(d => d.name.trim().toLowerCase() !== driverNameOld.toLowerCase())
            .map(d => d.carNumber);
        let assignedCarNumber = null;
        if (requestedCarNumber === 0) {
            for (let i = 1; i <= 8; i++) {
                if (!usedCarNumbers.includes(i)) {
                    assignedCarNumber = i;
                    break;
                }
            }
            if (!assignedCarNumber) {
                socket.emit('raceSession:driver:update:failure', { error: 'No available car numbers.' });
                return;
            }
        } else if (requestedCarNumber >= 1 && requestedCarNumber <= 8) {
            if (usedCarNumbers.includes(requestedCarNumber)) {
                socket.emit('raceSession:driver:update:failure', { error: `Car number ${requestedCarNumber} is already taken.` });
                return;
            } else {
                assignedCarNumber = requestedCarNumber;
            }
        } else {
            socket.emit('raceSession:driver:update:failure', { error: 'Invalid car number requested. Must be between 1 and 8, or 0 for auto.' });
            return;
        }
        driver.name = driverNameNew;
        driver.carNumber = assignedCarNumber;

        io.to('receptionist').emit('raceSession:driver:update:success', { sessionName, driverNameOld, driverNameNew, carNumber: assignedCarNumber });
        io.emit("race:update", raceTrackState);
    });

}