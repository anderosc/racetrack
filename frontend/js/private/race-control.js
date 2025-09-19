const socket = io();

const loginScreen = document.getElementById("loginScreen");
const uiScreen = document.getElementById("raceControl");
const loginBtn = document.getElementById("loginBtn");
const keyInput = document.getElementById("accessKey");
const loginErr = document.getElementById("loginErr");
const errTag = document.getElementById("err");

const initRace = document.getElementById("initRace");
const startRaceBtn = document.getElementById("startRaceBtn");
const endSessionBtn = document.getElementById("endSessionBtn");
const session = document.getElementById("session");
const safeBtn = document.getElementById("safe");
const hazardBtn = document.getElementById("hazard");
const dangerBtn = document.getElementById("danger");
const finishBtn = document.getElementById("finish");
const nextrace = document.getElementById("nextrace");
const tableBody = document.getElementById("tableBody");


const raceControls = document.getElementById("raceControls");

const raceTimer = document.getElementById("raceTimer");
const currentDrivers = document.getElementById("currentDrivers");

document.getElementById("logout").addEventListener("click", logout);

let timerInterval = null; 
let raceSeconds = 0;

function logout() {
    document.cookie = "raceControl_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    location.reload();
}

    // let data = {}
// Listen serverist tulevat state'i
function renderRaceState(state) {

  // Check if there is ongoing race and start it again
  if (state.currentRace?.isStarted && state.currentRace.durationSeconds > 0 && state.currentRace?.raceMode != "Finish") {
    startRaceBtn.style.display = "none";
    raceControls.style.display = "block";
    endSessionBtn.style.display = "none";
    errTag.style.display = "none"
    session.style.display = "block"
    nextrace.style.display = "none"
    session.innerHTML = `Current session :` + state.currentRace.sessionName
     if (!timerInterval) {

            timerInterval = setInterval(() => {
                if (state.currentRace.durationSeconds > 0) {
                    state.currentRace.durationSeconds--;
                    raceTimer.innerHTML = `<p>Timer : </p>${formatTime(state.currentRace.durationSeconds)}`;
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                      socket.emit("race:finish");
                      clearInterval(timerInterval);
                      endSessionBtn.style.display = "block"
                      raceControls.style.display = "none"
                }
            }, 1000);
        }
      return
  } else if (state.currentRace?.raceMode === "Finish") {

    startRaceBtn.style.display = "none"; 
    raceControls.style.display = "none";
    endSessionBtn.style.display = "block";
    errTag.style.display = "none"
    session.style.display = "block"
    nextrace.style.display = "none"
    session.innerHTML = `Current session :` + state.currentRace.sessionName
    if(timerInterval){
      clearInterval(timerInterval)
      timerInterval = null
    }
    return
  } else if (state.currentRace?.raceMode === "Danger" && state.currentRace?.isEnded == true  ) {

      if(state.upComingRaces.length == 0 || state.upComingRaces == null){
        startRaceBtn.style.display = "none";
        raceControls.style.display = "none";
        endSessionBtn.style.display = "none";
        session.style.display = "none"
        errTag.innerHTML ="No upcoming races"
        errTag.style.display = "block"
        nextrace.style.display = "none"
        return;
      } else { 

        startRaceBtn.style.display = "block";
        session.style.display = "none"

        raceControls.style.display = "none";
        endSessionBtn.style.display = "none";
        errTag.style.display = "none"
        nextrace.style.display = "block";
        //Render table of next drivers to DOM
        renderDrivers(state);
        return
    }
  } else{
    startRaceBtn.style.display = "block"
    raceControls.style.display = "none";
    endSessionBtn.style.display = "none";
    errTag.style.display = "none"
    nextrace.style.display = "none"
    return
  }


}

socket.on("race:update", renderRaceState);


// Login click
loginBtn.addEventListener("click", () => {
  if (keyInput.value) {
    socket.emit("login", { persona: "raceControl", token: keyInput.value });
  }
});

socket.on("login", (res) => {

  const persona = res.persona;
  const status = res.status;
    if(persona == "raceControl") {
      if (status) {
        if(res.cookie != true) {
          document.cookie = "raceControl_token=" +  keyInput.value + "; path=/";
        }
        loginScreen.style.display = "none";
        uiScreen.style.display = "block";
        loginErr.style.display = "none";

        // Emit init after loginit
        socket.emit("race:init");
      } else {
        loginErr.style.display = "block";
        keyInput.value = "";
      }
  }
});

// Start race
  startRaceBtn.addEventListener("click", () => {
    socket.emit("race:start");
});

    
// update timer inital value if it started

// Change race mode
  safeBtn.addEventListener("click", () => {
    socket.emit("race:safe");
  });
  hazardBtn.addEventListener("click", () => {
    socket.emit("race:hazard");
  });    
  dangerBtn.addEventListener("click", () => {
    socket.emit("race:danger");
  });

// End session

  endSessionBtn.addEventListener("click", (state) => {
    socket.emit("race:endSession", state);
    clearInterval(timerInterval);
    raceTimer.innerHTML = `<p>Timer : </p><div id="minutes"><p style="color: black;"> ` + 0 +` </p></div>`  + ':' + `<div id="minutes"><p style="color: black;"> ` + 0 +` </p></div>`
    socket.emit("race:init")

    // renderDrivers(state);
  });

// Finish session
    finishBtn.addEventListener("click", () => {
        socket.emit("race:finish");
        clearInterval(timerInterval);
        endSessionBtn.style.display = "block"
        raceControls.style.display = "none"
        timerInterval = null
    });

  socket.on("racecontrol:error", (errorMessage) =>{
    console.log("we got an error:", errorMessage)
    startRaceBtn.style.display = "block";
    raceControls.style.display = "none";
    endSessionBtn.style.display = "none";
    session.style.display = "none"
    errTag.innerHTML = errorMessage.message + ":" + errorMessage.error
    errTag.style.display = "block"

    if(timerInterval){
      clearInterval(timerInterval)
    }
  })
    

//remaining time from socket to seconds
  function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    if (m < 10) {
      m = '0' + m;
    }
    if (s < 10) {
      s = '0' + s;
    }
    //return divs with minutes and seconds 
      return ` <div id="minutes"><p style="color: black;"> ` +m +` </p></div>`  + ':' + `<div id="minutes"><p style="color: black;"> ` + s +` </p></div>`;
  }


  function renderDrivers(state){
     // First check if the data is malformed or there isnt any upcomming races.
    if(state === undefined){
        return;
    }
    
    const race = state.upComingRaces[0];
    errTag.style.display = "none";
    nextSession.innerHTML = "<p>Next Session: " + race.sessionName + "</p>";

    //Map the driver and car number as table into HTML tbody and join table rows.
    if(!race.drivers || race.drivers.length === 0){
      tableBody.innerHTML = `<tr><td> </td><td> </td></tr> `
      return;
    }
    const tableRows = race.drivers
        .map(driver => `<tr><td><p>${driver.name}</p></td><td><p>${driver.carNumber}</p></td></tr>`).join("");
    tableBody.innerHTML = tableRows;
  }
