import { raceTrackState } from './state.js';

export function raceControl(io, socket){

  let timerInterval = null;

  socket.on("race:init", (raceTrackState) =>{
    if(!raceTrackState.currentRace?.sessionName){
      if(!raceTrackState.upComingRaces?.[0]?.sessionName){

      } else {
      io.emit("race:update", assignNextRide())
      }
    }
  })


  socket.on('race:start', () => {
  // Timer loop - updates every second. 60 second development
  // TODO -> 10min for "npm run dev" and 60second for "npm start"
  raceTrackState.currentRace.raceMode = "Safe"
  timerInterval = setInterval(() => {
    if (!raceTrackState.currentRace?.durationSeconds){
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

  }, 1000);
  io.emit("state:update",  raceTrackState );
  });


  socket.on("race:safe", () => {
    raceTrackState.currentRace.raceMode = "Safe";
    io.emit("state:update", raceTrackState);
  })
  socket.on("race:hazard", () => {
    raceTrackState.currentRace.raceMode = "Hazard";
    io.emit("state:update", raceTrackState);
  })
  socket.on("race:danger", () => {
    raceTrackState.currentRace.raceMode = "Danger";
    io.emit("state:update", raceTrackState);
  })

  // End session for all.
  socket.on("race:endSession", () => {
    raceTrackState.raceHistory.push(raceTrackState.currentRace);
    raceTrackState.currentRace = null;
    io.emit("state:update",  raceTrackState);
  })

  //Finish session
  socket.on("race:finish", () =>{
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = null;
  //Push currentrace to History array and set current race to null.
  io.emit("state:update",  raceTrackState);
  });

}


function assignNextRide(){
  if (!raceTrackState.upComingRaces?.[0]?.sessionName){
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
      raceMode: null,
    }
    
  //Remove first element fromt upComingRace
  raceTrackState.upComingRaces.shift();
}