const socket = io();

document.getElementById("login").addEventListener("click", login);

function login() {
    const input = document.getElementById("token");
    if (input.value) {
        socket.emit('login', { persona: 'Receptionist', token: input.value });
    }
};

function logout() {
    document.cookie = "receptionist_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    location.reload();
}

function buildReceptionistPage() {

    const contentRef = document.getElementById("content");

    const contentBox1 = document.createElement('div');
    contentBox1.className = 'content-box';

    const rolePara = document.createElement('p');
    rolePara.textContent = 'Receptionist';

    const logoutDiv = document.createElement('div');
    logoutDiv.id = 'logout';
    logoutDiv.className = 'logout';

    const logoutPara = document.createElement('p');
    logoutPara.textContent = 'Logout';

    logoutDiv.appendChild(logoutPara);
    contentBox1.appendChild(rolePara);
    contentBox1.appendChild(logoutDiv);

    const contentBox2 = document.createElement('div');
    contentBox2.className = 'content-box';

    const createSessionPara = document.createElement('p');
    createSessionPara.textContent = 'Create New Race Session';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter race session name';
    input.id = 'raceSessionName';

    const createButtonDiv = document.createElement('div');
    createButtonDiv.id = 'createRaceSession';
    createButtonDiv.className = 'logout1';

    const buttonPara = document.createElement('p');
    buttonPara.textContent = 'Create Race Session';

    createButtonDiv.appendChild(buttonPara);
    contentBox2.appendChild(createSessionPara);
    contentBox2.appendChild(input);
    contentBox2.appendChild(createButtonDiv);

    contentRef.appendChild(contentBox1);
    contentRef.appendChild(contentBox2);

    document.getElementById("createRaceSession").addEventListener("click", createRaceSession);
    document.getElementById("logout").addEventListener("click", logout);
}

function createRaceSession() {
    const input = document.getElementById("raceSessionName");
    if (input.value) {
        socket.emit('raceSession:create', { name: input.value });
    }
    input.value = "";
}

socket.on('login', (msg) => {
    const input = document.getElementById("token");
    const persona = msg.persona;
    const status = msg.status;
    if(persona == "Receptionist") {
        if(status) {
            if(msg.cookie != true) {
                document.cookie = "receptionist_token=" +  input.value + "; path=/";
            }
            document.getElementsByClassName("loginbox")[0].remove();
            buildReceptionistPage();
        }else {
            document.getElementsByClassName("loginerror")[0].style.display = 'inline-block';
            input.value = "";
        }
    }
});

socket.on('raceSession:create:success', (msg) => {
    const raceSession = document.createElement("div");
    raceSession.className = "header";
    raceSession.innerHTML = msg.name;
    const content = document.getElementsByClassName("container right")[0];
    content.appendChild(raceSession);
});