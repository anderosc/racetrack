const socket = io();

document.getElementById("login").addEventListener("click", login);

function login() {
    const input = document.getElementById("token");
    if (input.value) {
        socket.emit('login', { persona: 'receptionist', token: input.value });
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
    editIcon.src = '/img/racer.png';

    editBox.appendChild(editIcon);
    innerBox.appendChild(editBox);

    scrollableContainerRef.appendChild(innerBox);
}

function createRacersBoxes() {
    
}

function deleteRaceBox(raceName) {
    const sessionNameToDelete = raceName.trim().toLowerCase();
    const boxes = document.querySelectorAll('.inner-box');
    boxes.forEach(box => {
        const dataName = box.innerText;
        if (dataName && dataName.trim().toLowerCase() === sessionNameToDelete) {
            box.remove();
        }
    });
}

function editRaceSession(event) {
    const element = event.currentTarget.closest(".inner-box");
    if (!element) return;
    const sessionName = element.innerText.trim();
    socket.emit('raceSession:get', { sessionName: sessionName });
}

function createRaceDriversBox() {
    // Create the outer container
    const container = document.createElement('div');
    container.className = 'drivers-container';

    // Create the box inside the container
    const box = document.createElement('div');
    box.className = 'drivers-box';

    // Create the paragraph
    const nameParagraph = document.createElement('p');
    nameParagraph.textContent = "Enter driver's name";

    // Create the input field
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = "Enter driver's name";
    input.id = 'raceDriverName';
    input.required = true;

    // Create label and its inner paragraph
    const label = document.createElement('label');
    label.setAttribute('for', 'cars');

    const chooseCarParagraph = document.createElement('p');
    chooseCarParagraph.textContent = 'Choose a car:';
    label.appendChild(chooseCarParagraph);

    // Create the select element
    const select = document.createElement('select');
    select.name = 'cars';
    select.id = 'cars';
    select.style.padding = '10px';
    select.style.margin = '10px';

    const options = ['auto', 'car1', 'car2', 'car3', 'car4', 'car5', 'car6', 'car7', 'car8'];
    options.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value.charAt(0).toUpperCase() + value.slice(1).replace(/\d/, d => ` ${d}`);
        select.appendChild(option);
    });

    // Create the inner box
    const innerBox = document.createElement('div');
    innerBox.className = 'inner-box-small';
    innerBox.style.width = '155px';
    innerBox.style.height = '56px';
    innerBox.style.top = '-5px';

    const innerText = document.createElement('p');
    innerText.textContent = 'Add driver';
    innerText.style.fontSize = '18px';

    innerBox.appendChild(innerText);

    // Assemble everything
    box.appendChild(nameParagraph);
    box.appendChild(input);
    box.appendChild(label);
    box.appendChild(select);
    box.appendChild(innerBox);
    container.appendChild(box);

    return container;
}

function deleteRaceSession(event) {
    const element = event.currentTarget.closest(".inner-box");
    if (!element) return;
    const sessionName = element.innerText.trim();
    socket.emit('raceSession:delete', { sessionName: sessionName });
}

socket.on('login', (msg) => {
    const input = document.getElementById("token");
    const persona = msg.persona;
    const status = msg.status;
    if(persona == "receptionist") {
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

socket.on('raceList', (raceSessions) => {
    raceSessions.forEach(element => {
        createRaceBox(element.sessionName);
    });
});

socket.on('raceSession:create:success', (raceSession) => {
    createRaceBox(raceSession.sessionName);
});

socket.on('raceSession:get:success', (raceSession) => {
    const raceSessionName = raceSession.sessionName;
    const allInnerBoxes = document.querySelectorAll('.inner-box');
    for (const box of allInnerBoxes) {
        const p = box.querySelector('p');
        if (p && p.textContent.trim() === raceSessionName) {
            // Prevent duplicates
            if (!box.nextElementSibling || !box.nextElementSibling.classList.contains('drivers-container')) {
                const form = createRaceDriversBox();
                box.insertAdjacentElement('afterend', form);
            }
            break;
        }
    }
});

socket.on('raceSession:delete:success', (raceSession) => {
    deleteRaceBox(raceSession.sessionName);
});