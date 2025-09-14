const socket = io();

const container = document.getElementById("buttonsContainer");

let currentRaceName = null;

// dynamically create buttons based on currentRace drivers
function renderCarButtonsOnce(drivers, raceName) {
    if (currentRaceName === raceName) return;
    currentRaceName = raceName;

    container.innerHTML = '';
    drivers.forEach(driver => {
        const btn = document.createElement("button");
        btn.classList.add("car-button");
        btn.innerText = `Car ${driver.carNumber}`;
        btn.addEventListener("click", () => completeLap(driver.carNumber));
        container.appendChild(btn);
    });

}

// send lap completion to server
function completeLap(carNumber) {
    socket.emit('lap:completed', { driver: carNumber });
}

// handle disabling buttons when race finishes
function disableButtons() {
    document.querySelectorAll(".car-button").forEach(btn => {
        btn.disabled = true;
        btn.classList.add("disabled");
    });
}

// listen race state updates
socket.on('state:update', (state) => {
    const currentRace = state.currentRace;


    if (!currentRace || !currentRace.drivers || currentRace.drivers.length === 0 || currentRace.isEnded) {
        container.innerHTML = '<p>No Race found.</p>';
        currentRaceName = null;
        return;
    }

    renderCarButtonsOnce(currentRace.drivers, currentRace.sessionName);

    // disable buttons if race finished
    if (currentRace.raceMode === 'Finish') {
        disableButtons();
    }
});
socket.on('race:update', (state) => {
    const currentRace = state.currentRace;
    if (currentRace && currentRace.raceMode === 'Finish') {
        disableButtons();
    }

});

socket.on('connect', () => {
    socket.emit('race:requestState')
})