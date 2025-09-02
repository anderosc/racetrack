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
        //TODO CHECK FOR DUPLICATE NAME
        raceTrackState.upComingRaces.push(
            {
                sessionName : nextRaceSession.sessionName,
                drivers : [],
                durationSeconds : 30
            }
        )
        io.to('receptionist').emit('raceSession:create:success', nextRaceSession);
    });

    socket.on('raceSession:delete', (RaceSession) => {
        //CHECK FOR AUTHORIZATION
        if(!isLoggedIn(socket, 'receptionist')){
            socket.emit('raceSession:delete:failure', {error: 'User Is Not Logged into receptionist.'});
            return;
        }
        const sessionNameToDelete = RaceSession.sessionName.trim().toLowerCase();
        const wasDeleted = raceTrackState.upComingRaces.some(
            race => race.sessionName.trim().toLowerCase() === sessionNameToDelete
        );

        raceTrackState.upComingRaces = raceTrackState.upComingRaces.filter(
            race => race.sessionName.trim().toLowerCase() !== sessionNameToDelete
        );

        if (wasDeleted) {
            io.to('receptionist').emit('raceSession:delete:success', RaceSession);
        } else {
            //console.log(`No matching session found to delete: ${RaceSession.sessionName}`);
        }
    });

}