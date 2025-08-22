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

    const contentRef = document.getElementById('content');

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
    input.required = true;

    const createButtonDiv = document.createElement('div');
    createButtonDiv.id = 'createRaceSession';
    createButtonDiv.className = 'logout1';

    const buttonPara = document.createElement('p');
    buttonPara.textContent = 'Create Race Session';

    const scrollableContainer = document.createElement('div');
    scrollableContainer.className = 'scrollable-container';

    createButtonDiv.appendChild(buttonPara);
    contentBox2.appendChild(createSessionPara);
    contentBox2.appendChild(input);
    contentBox2.appendChild(createButtonDiv);

    contentRef.appendChild(contentBox1);
    contentRef.appendChild(contentBox2);
    contentRef.appendChild(scrollableContainer);

    document.getElementById("createRaceSession").addEventListener("click", createRaceSession);
    document.getElementById("logout").addEventListener("click", logout);
}

function createRaceSession() {
    const input = document.getElementById("raceSessionName");
    if (input.value) {
        socket.emit('raceSession:create', { sessionName: input.value }); //, drivers: []
    }
    input.value = "";
}

function createRaceBox(raceName) {

    //Reference to scrollable container
    const scrollableContainerRef = document.getElementsByClassName("scrollable-container")[0];

    // Create main container
    const innerBox = document.createElement('div');
    innerBox.className = 'inner-box';

    // Create first flipped flag icon
    const flagIconLeft = document.createElement('img');
    flagIconLeft.className = 'icon flip';
    flagIconLeft.src = '/img/raceFlagIcon.png';
    innerBox.appendChild(flagIconLeft);

    // Create paragraph
    const paragraph = document.createElement('p');
    paragraph.textContent = raceName;
    innerBox.appendChild(paragraph);

    // Create second flag icon
    const flagIconRight = document.createElement('img');
    flagIconRight.className = 'icon';
    flagIconRight.src = '/img/raceFlagIcon.png';
    innerBox.appendChild(flagIconRight);

    // Create delete button
    const deleteBox = document.createElement('div');
    deleteBox.className = 'delete inner-box-small';
    deleteBox.addEventListener("click", deleteRaceSession);
    const deleteIcon = document.createElement('img');
    deleteIcon.className = 'icon';
    deleteIcon.src = '/img/deleteIcon.png';
    deleteBox.appendChild(deleteIcon);

    innerBox.appendChild(deleteBox);

    // Create edit button
    const editBox = document.createElement('div');
    editBox.className = 'edit inner-box-small';
    editBox.style.right = '80px';
    editBox.addEventListener("click", editRaceSession);

    const editIcon = document.createElement('img');
    editIcon.className = 'icon';
    editIcon.src = '/img/editIcon.png';

    editBox.appendChild(editIcon);
    innerBox.appendChild(editBox);

    scrollableContainerRef.appendChild(innerBox);
}

function editRaceSession(event) {
    const element = event.currentTarget.closest(".inner-box");
    console.log("Selected Race Session EDIT: " + element.innerText);
}

function deleteRaceSession(event) {
    const element = event.currentTarget.closest(".inner-box");
    if (!element) return;
    const sessionName = element.innerText.trim();
    socket.emit('raceSession:delete', { sessionName: sessionName });
    element.remove();
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

socket.on('raceSession:create:success', (raceSession) => {
    createRaceBox(raceSession.sessionName);
});

socket.on('raceList', (raceSessions) => {
    raceSessions.forEach(element => {
        createRaceBox(element.sessionName);
    });
});