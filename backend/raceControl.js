import { raceTrackState } from './state.js';

export function raceControl(io, socket){
  // console.log(raceTrackState.upComingRaces[0].sessionName)


  let timerInterval = null;

  socket.on('race:start', () => {
  if (!raceTrackState.upComingRaces[0].sessionName){
      // console.log(raceTrackState.upComingRaces[0].sessionName)
    return;
  }

  //Assign next race values to global currentRace variable.
  raceTrackState.currentRace = {
    sessionName: raceTrackState.upComingRaces[0].sessionName,
    startTime: null,
    endTime: null,
    drivers: raceTrackState.upComingRaces[0].drivers,
    durationSeconds: raceTrackState.upComingRaces[0].durationSeconds,
    raceMode: 'Safe',
  }

  //Remove first element fromt upComingRace
  raceTrackState.upComingRaces.shift();

  // Timer loop - updates every second. 60 second development
  // TODO -> 10min for "npm run dev" and 60second for "npm start"
  timerInterval = setInterval(() => {
    if (!raceTrackState.currentRace.durationSeconds){
      return;
    }

    //Countdown seconds
  raceTrackState.currentRace.durationSeconds = raceTrackState.currentRace.durationSeconds - 1;

    //If timer reaches 0 then stop timer and set race mode "Finish"
  if (raceTrackState.currentRace.durationSeconds <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    raceTrackState.currentRace.durationSeconds = 0;
    raceTrackState.currentRace.raceMode = "Finish";
  }
  io.emit("state:update",  raceTrackState.currentRace );

  }, 1000);


  });

  // Change mode, sent from race-control. Saved into object
  socket.on('race:changeMode', ( mode ) => {
    if (raceTrackState.currentRace.sessionName) {
      raceTrackState.currentRace.raceMode = mode;
      io.emit("state:update", raceTrackState.currentRace);
    }
  });

  // End session for all.
  socket.on('race:endSession', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = null;
    io.emit("state:update",  raceTrackState.currentRace);
    //Pus currentrace to History array and set current race to null.
    raceTrackState.raceHistory.push(raceTrackState.currentRace);
    raceTrackState.currentRace = null;
    // console.log("this is history:", raceTrackState.raceHistory)

  });
}