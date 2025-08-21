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
      durationSeconds: 60,
    },
  ],

  //Race Control takes the first element of upComingRaces and assignes its values to currentRace. Then removes 
  // first element of upComingRaces
  currentRace: {
    sessionName: null,
    drivers: [],
    durationSeconds: null,
    raceMode: 'Safe',
  },
  //When current race ends, it will be pushed to history.
  raceHistory: [
    
  ]
}

