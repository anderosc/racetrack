import { raceTrackState } from './state.js';

// Updates the DOM when a prev race is finished.
export function nextRaceLogic(io, socket) {
    // Update next race session
socket.on("nextRace:get", () => {
    io.emit("nextRace:update", raceTrackState.upComingRaces[0]);
    console.log(raceTrackState.upComingRaces[0])
});
}
