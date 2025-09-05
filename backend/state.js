import fs from "fs";

const stateFile = "raceState.json";


// state.js
export let raceTrackState = {
  //Upcoming races -> pushed from front desk(?)
  upComingRaces: [
    {
      sessionName: 'race1',
      drivers: [
        { 
          name: 'Milvi', 
          carNumber: 1, 
          fastestLap: null, 
          currentLap: 0 },
        { 
          name: 'Endel', 
          carNumber: 2, 
          fastestLap: null, 
          currentLap: 0 },
      ],
      durationSeconds: null,
      raceMode: "",
      isStarted : false,
      isEnded : false,
    },
    {
      sessionName: 'race2',
      drivers: [
        { 
          name: 'Milvikas', 
          carNumber: 1, 
          fastestLap: null, 
          currentLap: 0 },
        { 
          name: 'Endelhehe', 
          carNumber: 2, 
          fastestLap: null, 
          currentLap: 0 },
      ],
      durationSeconds: null,
      raceMode: "",
      isStarted : false,
      isEnded : false,
    },
  ],

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