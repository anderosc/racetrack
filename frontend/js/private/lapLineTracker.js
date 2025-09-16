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
    socket.emit('race:requestState');
})