const socket = io();

const container = document.getElementById("buttonsContainer");
const lapLineTracker = document.getElementById("lapLineTracker");

document.getElementById("login").addEventListener("click", login);

function login() {
    const input = document.getElementById("token");
    if (input.value) {
        socket.emit('login', { persona: 'lapLineTracker', token: input.value });
    }
};

function logout() {
    document.cookie = "lapLineTracker_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    location.reload();
}

socket.on('login', (msg) => {
    const input = document.getElementById("token");
    const persona = msg.persona;
    const status = msg.status;
    if(persona == "lapLineTracker") {
        if(status) {
            if(msg.cookie != true) {
                document.cookie = "lapLineTracker_token=" +  input.value + "; path=/";
            }
            document.getElementsByClassName("loginbox")[0].remove();
            lapLineTracker.style.display = "block";
            document.getElementById("logout").addEventListener("click", logout);
        }else {
            document.getElementsByClassName("loginerror")[0].style.display = 'inline-block';
            input.value = "";
        }
    }
});

let currentRaceName = null;
let raceIsFinished = false;

// dynamically create buttons based on currentRace drivers
function renderCarButtonsOnce(drivers, raceName) {
    if (currentRaceName === raceName) return;
    currentRaceName = raceName;

    container.innerHTML = '';
    drivers.forEach(driver => {
        const btn = document.createElement("button");
        btn.classList.add("car-button");
        btn.innerHTML = `<p style="color: black;">Car ${driver.carNumber}</p>`;
        btn.addEventListener("click", () => completeLap(driver.carNumber));
        container.appendChild(btn);
    });

}

// send lap completion to server
function completeLap(carNumber) {
    socket.emit('lap:completed', { driver: carNumber });
}

// handle removing buttons when race finishes
function clearButtons() {
    container.innerHTML = '';
}

// listen race state updates
socket.on('state:update', (state) => {
    if (raceIsFinished) return;
    const currentRace = state.currentRace;


    if (!currentRace || !currentRace.drivers || currentRace.drivers.length === 0 || currentRace.raceMode === "Finish" || currentRace.isEnded) {
        container.innerHTML = `
        <div class="centerDiv">
            <p style="color: red;">No active races at the moment.</p>
        </div>
            `;

        currentRaceName = null;
        return;
    }
    if (raceIsFinished) return;
    renderCarButtonsOnce(currentRace.drivers, currentRace.sessionName);

});
socket.on('race:finish', (state) => {
    raceIsFinished = true;
    container.innerHTML = `
        <div class="centerDiv">
            <p style="color: red;">No active races at the moment.</p>
        </div>
    `;
    clearButtons();
    currentRaceName = null;
});

socket.on('race:update', (state) => {
    const currentRace = state.currentRace;
    if (currentRace && currentRace.raceMode === 'Finish') {
        container.innerHTML = `
        <div class="centerDiv">
            <p style="color: red;">No active races at the moment.</p>
        </div>
            `;
        clearButtons();
    }

});


socket.on('connect', () => {
    socket.emit('race:requestState');
})