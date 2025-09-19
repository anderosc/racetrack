import fs from "fs";

const stateFile = "raceState.json";


// state.js
export let raceTrackState = {
  //Upcoming races -> pushed from front desk(?)
  upComingRaces: [],
  //Race Control takes the first element of upComingRaces and assignes its values to currentRace. Then removes 
  // first element of upComingRaces
  currentRace: {
    sessionName: "",
    drivers: [],
    durationSeconds: 0,
    raceMode: "",
    isStarted: false,
    isEnded : false,
  },
}

//Save state to file. If server is closed, data is saved.
export function saveState() {
    fs.writeFileSync(stateFile, JSON.stringify(raceTrackState, null, 2));
    // console.log(" State saved");  
}

//Read from file and rewrite the raceTrackState variable
export let defaultState = raceTrackState;
if (fs.existsSync(stateFile)) {
    const data = fs.readFileSync(stateFile, "utf-8");
    raceTrackState = JSON.parse(data);
    // console.log("Loaded ");

}