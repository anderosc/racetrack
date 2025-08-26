const socket = io();

const container = document.getElementById("buttonsContainer");

// dynamically create buttons based on currentRace drivers
function renderCarButtons(drivers) {
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

// listen race state updates
socket.on('state:update', (currentRace) => {
    if (!currentRace || !currentRace.drivers) return;
    renderCarButtons(currentRace.drivers);

    // disable buttons if race finished
    if (currentRace.raceMode === 'Finish') {
        document.querySelectorAll(".car-button").forEach(btn => {
            btn.disabled = true;
            btn.classList.add("disabled");
        });
    }
});