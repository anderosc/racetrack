import { raceTrackState } from './state.js';

export function raceControl(io, socket){

  let timerInterval = null;

  socket.on("race:init", () =>{
    socket.emit("race:init:update", raceTrackState)
  });


  socket.on("race:getState", (_, callback) => {
    // if(!raceTrackState.currentRace?.sessionName){
    //   if(!raceTrackState.upComingRaces?.[0]?.sessionName){
    //       return;
    //   } 
    // }
    callback(raceTrackState); 
    // console.log(raceTrackState)
  });

  socket.on('race:start', () => {
  // Timer loop - updates every second. 60 second development
  // TODO -> 10min for "npm run dev" and 60second for "npm start"
  assignNextRace()
  // console.log(state)
  io.emit("race:update", raceTrackState)
  raceTrackState.currentRace.raceMode = "Safe"
  raceTrackState.currentRace.isStarted = true;

  timerInterval = setInterval(() => {

    if (!raceTrackState.currentRace?.durationSeconds){
      return;
    }

    //Countdown seconds
  raceTrackState.currentRace.durationSeconds = raceTrackState.currentRace.durationSeconds - 1;
  // console.log(raceTrackState.currentRace.durationSeconds)

    //If timer reaches 0 then stop timer
  if (raceTrackState.currentRace.durationSeconds <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    raceTrackState.currentRace.durationSeconds = 0;
    raceTrackState.currentRace.raceMode = "Finish";
    io.emit("race:finish", raceTrackState)
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
    raceTrackState.currentRace.raceMode = "Danger"
    // raceTrackState.raceHistory.push(raceTrackState.currentRace);
    raceTrackState.currentRace.isEnded = true;
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


 function assignNextRace(){
  // console.log("what is happening")
  if (!raceTrackState.upComingRaces?.[0]?.sessionName){
      // console.log("sessionname: " , raceTrackState.upComingRaces[0].sessionName)
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
    // console.log(raceTrackState.currentRace)
  //Remove first element fromt upComingRace
  //TODO: IF it is last element, delete it.
  raceTrackState.upComingRaces.shift();
}


