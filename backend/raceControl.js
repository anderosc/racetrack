import { raceTrackState, saveState  } from './state.js';


  let timerInterval = null;
  //Check in which envrionment sevrer started -> production or development. Assign race duration.
  const TIMER_DURATION = process.env.NODE_ENV === 'development' ? 60 : 600;

  export function raceControl(io, socket){

        function isLoggedIn(socket, room) {
          return socket.rooms.has(room);
      }

      //"Immediately Invoked Function Expression"
      // Check before if server was closed before and do we have current race saved data. If yes, continue it.
    (function startRaceIfOngoing() {

      if (!timerInterval && raceTrackState.currentRace.isStarted && !raceTrackState.currentRace.isEnded) {
          timerInterval = setInterval(() => {
              raceTrackState.currentRace.durationSeconds -= 1;
              // If timer reaches 0
              if (raceTrackState.currentRace.durationSeconds <= 0) {
                  clearInterval(timerInterval);
                  timerInterval = null;
                  raceTrackState.currentRace.durationSeconds = 0;
                  raceTrackState.currentRace.raceMode = "Finish";
              }
              saveState();
          }, 1000);
      }
  })();
  

  socket.on("race:init", () =>{
      if(!isLoggedIn(socket, 'raceControl')){
        socket.emit('racecontrol:error', 
        {message: 'User Is Not Logged in. Refresh the page and log in.',error: ""});
        return;
      }
    try{
    
    socket.emit("race:update", raceTrackState)
    } catch (err){
      console.error("Page init error:", err);
      socket.emit("racecontrol:error", { message: "Init error", error: err.toString() });
    }
  });

  socket.on('race:start', () => {
    if(!isLoggedIn(socket, 'raceControl')){        socket.emit('racecontrol:error', 
      {message: 'User Is Not Logged in. Refresh the page and log in.',error: ""});
      return;
    }

    //Lets
    const success = assignNextRace();
    if (!success) {
      return; 
    }

    saveState();
    raceTrackState.currentRace.raceMode = "Safe"
    raceTrackState.currentRace.isStarted = true;
    raceTrackState.currentRace.isEnded = false;
    raceTrackState.currentRace.durationSeconds = TIMER_DURATION;
    io.emit("race:update", raceTrackState)

    // Timer loop - updates every second. 60 second development, 600 for production
    timerInterval = setInterval(() => {
        try{
          if (!raceTrackState.currentRace?.durationSeconds){
            return;
          }
          //Countdown seconds
          raceTrackState.currentRace.durationSeconds = raceTrackState.currentRace.durationSeconds - 1;
          //If timer reaches 0 then stop timer
          if (raceTrackState.currentRace.durationSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            raceTrackState.currentRace.durationSeconds = 0;
            raceTrackState.currentRace.raceMode = "Finish";
            io.emit("race:finish", raceTrackState)
          }
          saveState();
      } catch(err){
        console.log( "Timer error: ", err)
        socket.emit("racecontrol:error", { message: "Timer error", error: err.toString() });
      }
    }, 1000);
    io.emit("state:update",  raceTrackState );
  });

  //Change modes, update them
  socket.on("race:safe", () => {
    if(!isLoggedIn(socket, 'raceControl')){
      socket.emit('racecontrol:error', 
      {message: 'User Is Not Logged in. Refresh the page and log in.',error: ""});
      return;
    }
    raceTrackState.currentRace.raceMode = "Safe";
    io.emit("race:update", raceTrackState);
  })

  socket.on("race:hazard", () => {
    if(!isLoggedIn(socket, 'raceControl')){
      socket.emit('racecontrol:error', 
      {message: 'User Is Not Logged in. Refresh the page and log in.',error: ""});
      return;
    }
    raceTrackState.currentRace.raceMode = "Hazard";
    io.emit("race:update", raceTrackState);
  })

  socket.on("race:danger", () => {
    if(!isLoggedIn(socket, 'raceControl')){
      socket.emit('racecontrol:error', 
      {message: 'User Is Not Logged in. Refresh the page and log in.',error: ""});
      return;
    }
    raceTrackState.currentRace.raceMode = "Danger";
    io.emit("race:update", raceTrackState);
  })

  // End session for all.
  socket.on("race:endSession", () => {
    if(!isLoggedIn(socket, 'raceControl')){
      socket.emit('racecontrol:error', 
      {message: 'User Is Not Logged in. Refresh the page and log in.',error: ""});
      return;
    }
    raceTrackState.currentRace.raceMode = "Danger"
    raceTrackState.currentRace.isEnded = true;
    io.emit("race:update",  raceTrackState);
  })

  //Finish session
  socket.on("race:finish", () =>{
    if(!isLoggedIn(socket, 'raceControl')){
      socket.emit('racecontrol:error', 
      {message: 'User Is Not Logged in. Refresh the page and log in.',error: ""});
      return;
    }
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = null;
  raceTrackState.currentRace.durationSeconds = 0;
  raceTrackState.currentRace.raceMode = "Finish"
  //Push currentrace to History array and set current race to null.
  io.emit("race:update",  raceTrackState);
  });




 function assignNextRace(){
  //Before assigning next race and making changes in object, check if the data is correct
  try{
    //Is next session created?
    if (!raceTrackState.upComingRaces?.[0]){
       socket.emit("racecontrol:error", { 
        message: "No upcoming races", 
        error: "" 
      });

      return false;
    }
    //Are there any drivers assigned?
    if(raceTrackState.upComingRaces[0].drivers.length === 0){
      socket.emit("racecontrol:error", {
        message: "Missing drivers from next race",
        error: ""
      })

      return false;
    }

    //Do drivers have name and car
    for(const driver of raceTrackState.upComingRaces[0].drivers){
      if (!driver.name || driver.name.trim() === "") {
        socket.emit("racecontrol:error", {
        message: "Missing driver name in drivers list.",
        error: JSON.stringify(driver)
        })

      return false;
      }
      if (driver.carNumber == null) {
        socket.emit("racecontrol:error", {
        message: "Missing assigned car in drivers list.",
        error: JSON.stringify(driver)
        })

      return false;
      }
    }
    

      //If prev checks passed, assign next race values to global currentRace obj.
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
  return true;
    
    } catch(err){
      console.error("Error in next race assignment:", err);
      socket.emit("racecontrol:error", { message: "Error in next race assignment:", error: err.toString() });
      return;
    }
  }
}


