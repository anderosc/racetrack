import { raceTrackState } from './state.js';

// Updates the DOM when a prev race is finished.
export function nextRaceLogic(io, socket) {
    // Update next race session
socket.on("state:get", () => {
    io.emit("state:update", raceTrackState);
    console.log(raceTrackState.upComingRaces[0])
});
}
