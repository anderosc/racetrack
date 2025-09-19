const socket = io();

const body =document.getElementById("main")
const err = document.getElementById("err");
const nextSession = document.getElementById("nextSession");

function updateNextRace(state) {
    // First check if the data is malformed or there isnt any upcomming races.
    if(state === undefined){
        return;
    }
    if(!state?.upComingRaces || state.upComingRaces.length === 0){
      err.style.display = "block"
      nextSession.style.display = "none";
      body.style.display = "none";
      // console.log("wtf")
      return;
    }else{
      err.style.display = "none"
      nextSession.style.display = "block";
      body.style.display = "block";
    }
    const race = state.upComingRaces[0];
    if(state.currentRace?.isStarted && !state.currentRace?.isEnded){
      nextSession.innerHTML = "<p> Next race session, proceed to the grid  </p>  <p>Session: " + race.sessionName + "  </p>";
    } else{
      nextSession.innerHTML = "<p>Next Session: " + race.sessionName + "</p>";
    }
    

    err.style.display = "none";

    const tableBody = document.getElementById("tableBody");

    //Map the driver and car number as table into HTML tbody and join table rows.
    if(!race.drivers || race.drivers.length === 0){
      tableBody.innerHTML = `<tr><td> </td><td> </td></tr> `
      return;
    }
    const tableRows = race.drivers
        .map(driver => `<tr><td><p>${driver.name}</p></td><td><p>${driver.carNumber}</p></td></tr>`).join("");

    tableBody.innerHTML = tableRows;
  }

// If connected, get update
socket.on("connect", () => {
    socket.emit("state:get");
});

// Take data and call function to update ui. Listen to future updates.
socket.on("race:update", (state) => {
    console.log(state)
    updateNextRace(state);
});