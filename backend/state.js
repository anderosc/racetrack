// state.js
export let raceTrackState = {
  //Upcoming races -> pushed from front desk(?)
  upComingRaces: [
    // {
    //   sessionName: 'race1',
    //   drivers: [
    //     { 
    //       name: 'Milvi', 
    //       carNumber: 1, 
    //       fastestLap: null, 
    //       currentLap: 0 },
    //     { 
    //       name: 'Endel', 
    //       carNumber: 2, 
    //       fastestLap: null, 
    //       currentLap: 0 },
    //   ],
    //   durationSeconds: 60,
    //   raceMode: "",
    //   isStarted : false,
    //   isEnded : false,
    // },
    // {
    //   sessionName: 'race2',
    //   drivers: [
    //     { 
    //       name: 'Milvikas', 
    //       carNumber: 1, 
    //       fastestLap: null, 
    //       currentLap: 0 },
    //     { 
    //       name: 'Endelhehe', 
    //       carNumber: 2, 
    //       fastestLap: null, 
    //       currentLap: 0 },
    //   ],
    //   durationSeconds: 60,
    //   raceMode: "",
    //   isStarted : false,
    //   isEnded : false,
    // },
  ],

  //Race Control takes the first element of upComingRaces and assignes its values to currentRace. Then removes 
  // first element of upComingRaces
  currentRace: {
    sessionName: "",
    startTime: "",
    endTime: null,
    drivers: [],
    durationSeconds: 0,
    raceMode: "",
    isStarted: false,
    isEnded : false,
  },
  //When current race ends, it will be pushed to history.
  raceHistory: [
    
  ]
}

