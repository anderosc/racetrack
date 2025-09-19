const socket = io();

document.getElementById("login").addEventListener("click", login);

function showError(message) {
  const container = document.getElementById("error-container");

  const box = document.createElement("div");
  box.className = "error-box";
  box.innerHTML = `
    <button class="close-btn">&times;</button>
    ${message}
  `;

  box.querySelector(".close-btn").onclick = () => {
    container.removeChild(box);
  };

  container.appendChild(box);

  setTimeout(() => {
    if (container.contains(box)) {
      container.removeChild(box);
    }
  }, 5000);
}

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
    const sessionName = input.value;
    if (sessionName) {
        socket.emit('raceSession:create', { sessionName: sessionName });
        input.value = "";
    }
}

function createRaceBox(raceName) {
    // Reference to scrollable container
    const scrollableContainerRef = document.getElementsByClassName("scrollable-container")[0];

    // Create outer race session container
    const raceSessionContainer = document.createElement('div');
    raceSessionContainer.className = 'race-session';

    // Create main container (inner box)
    const innerBox = document.createElement('div');
    innerBox.className = 'inner-box';

    // Create first flipped flag icon
    const flagIconLeft = document.createElement('img');
    flagIconLeft.className = 'raceFlagIcon icon flip';
    flagIconLeft.src = '/img/raceFlagIcon.png';
    innerBox.appendChild(flagIconLeft);

    // Create race name paragraph
    const paragraph = document.createElement('p');
    paragraph.className = 'race-session-name';
    paragraph.textContent = raceName;
    innerBox.appendChild(paragraph);

    // Create second flag icon
    const flagIconRight = document.createElement('img');
    flagIconRight.className = 'raceFlagIcon icon';
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
    /*editBox.style.right = '80px';*/
    editBox.addEventListener("click", editRaceSession);

    const editIcon = document.createElement('img');
    editIcon.className = 'icon';
    editIcon.src = '/img/racer.png';
    editBox.appendChild(editIcon);
    innerBox.appendChild(editBox);

    // Append innerBox to race-session container
    raceSessionContainer.appendChild(innerBox);

    // Finally append the whole race-session container to scrollable container
    scrollableContainerRef.appendChild(raceSessionContainer);
}


function deleteRaceBox(raceName) {
    const sessionNameToDelete = raceName.trim().toLowerCase();
    const boxes = document.querySelectorAll('.race-session');

    boxes.forEach(session => {
        const innerBox = session.querySelector('.inner-box');
        const nameElement = innerBox.querySelector('p');

        if (nameElement && nameElement.textContent.trim().toLowerCase() === sessionNameToDelete) {
            session.remove();
        }
    });
}

function deleteRaceDriverBox(sessionName, driverName) {
    const allDriverBoxes = document.querySelectorAll('.drivers-box');

    allDriverBoxes.forEach(driverBox => {
        const nameEl = driverBox.querySelector('.driverName');
        const thisDriverName = nameEl?.textContent.trim().toLowerCase();
        const thisSessionEl = driverBox.closest('.race-session')?.querySelector('.race-session-name');
        const thisSessionName = thisSessionEl?.textContent.trim().toLowerCase();

        if (
            thisDriverName === driverName.trim().toLowerCase() &&
            thisSessionName === sessionName.trim().toLowerCase()
        ) {
            driverBox.remove();
        }
    });
}

function editRaceSession(event) {
    const element = event.currentTarget.closest(".inner-box");
    if (!element) return;
    const sessionName = element.innerText.trim();
    socket.emit('raceSession:get', { sessionName: sessionName });
}

function createRaceDriversBox(drivers) {
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
    input.className = 'race-driver-name';
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

    const options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    options.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        if(option.value == 0) {
            option.textContent = 'Auto';
        } else {
            option.textContent =  'Car ' + value;
        }
        
        select.appendChild(option);
    });

    // Create the inner box
    const innerBox = document.createElement('div');
    innerBox.className = 'inner-box-small';
    innerBox.style.width = '155px';
    innerBox.style.height = '55px';
    innerBox.style.top = '-5px';
    innerBox.addEventListener("click", addDriver);

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

    let counter = 1;

    drivers.forEach(element => {
        const driverItem = document.createElement('div');
        driverItem.className = "drivers-box";
        const nameText = document.createElement('p');
        nameText.className = "driverName";
        nameText.textContent = element.name;
        nameText.style.fontSize = '18px';

        const carNumberText = document.createElement('p');
        carNumberText.className = "driverCarNumber";
        carNumberText.textContent = " - Car " + element.carNumber;
        carNumberText.style.fontSize = '18px';
        
        driverItem.appendChild(nameText);
        driverItem.appendChild(carNumberText);

        const numberBox = document.createElement('div');
        numberBox.className = 'inner-box-small driver-number';

        const numberText = document.createElement('p');
        numberText.textContent = element.carNumber;
        numberText.style.fontSize = '18px';
        numberBox.appendChild(numberText);
        driverItem.appendChild(numberBox);

        const deleteBox = document.createElement('div');
        deleteBox.className = 'delete inner-box-small';
        deleteBox.style.height = '55px';
        deleteBox.style.width = '60px';
        deleteBox.addEventListener("click", removeDriver);

        const deleteImg = document.createElement('img');
        deleteImg.className = 'icon-small';
        deleteImg.src = '/img/deleteIcon.png';
        deleteBox.appendChild(deleteImg);
        driverItem.appendChild(deleteBox);

        const editBox = document.createElement('div');
        editBox.className = 'edit1 inner-box-small';

        const editImg = document.createElement('img');
        editImg.className = 'icon-small';
        editImg.src = '/img/editIcon.png';
        editBox.addEventListener("click", editDriver);
        editBox.appendChild(editImg);
        driverItem.appendChild(editBox);

        container.appendChild(driverItem);

        counter++;
    });

    return container;
}

function deleteRaceSession(event) {
    const element = event.currentTarget.closest(".race-session");
    if (!element) return;
    const sessionName = element.getElementsByClassName("race-session-name")[0].innerText.trim();
    if (!sessionName) return;
    socket.emit('raceSession:delete', { sessionName: sessionName });
}

function addDriver(event) {
    const element = event.currentTarget.closest(".race-session");
    if (!element) return;
    const sessionName = element.getElementsByClassName("race-session-name")[0].innerText.trim();
    if (!sessionName) return;
    const driverName = element.querySelector("#raceDriverName").value.trim();
    const carNumber = +element.querySelector("#cars").value;
    if(driverName) {
        socket.emit('raceSession:driver:add', { sessionName: sessionName, driver: {name: driverName, carNumber: carNumber} });
    }
    element.querySelector("#raceDriverName").value = "";
    element.querySelector("#cars").value = 0;
}

function removeDriver(event) {
    const element = event.currentTarget.closest(".drivers-box");
    if (!element) return;
    const element1 = event.currentTarget.closest(".race-session");
    if (!element1) return;
    const sessionName = element1.getElementsByClassName("race-session-name")[0].innerText.trim();
    if (!sessionName) return;
    const driverName = element.getElementsByClassName("driverName")[0].innerText.trim();
    if (!driverName) return;
    const carNumberStr = element.getElementsByClassName("driverCarNumber")[0].innerText.trim();
    if (!carNumberStr) return;
    const carNumber = carNumberStr[carNumberStr.length - 1];
    if(sessionName && driverName && carNumber) {
        socket.emit('raceSession:driver:remove', { sessionName: sessionName, driverName: driverName });
    }
}

function editDriver(event) {
    const driverBox = event.currentTarget.closest(".drivers-box");
    if (!driverBox) return;
    const element1 = event.currentTarget.closest(".race-session");
    if (!element1) return;
    const sessionName = element1.getElementsByClassName("race-session-name")[0].innerText.trim();
    if (!sessionName) return;
    const existingForm = driverBox.querySelector(".edit-form");
    const saveForm = driverBox.querySelector(".save");
    const driverNameEl = driverBox.querySelector(".driverName");
    const driverCarEl = driverBox.querySelector(".driverCarNumber");

    if (existingForm) {
        existingForm.remove();
        saveForm.remove();
        driverNameEl.style.display = "";
        driverCarEl.style.display = "";
        return;
    }

    const driverNameOld = driverNameEl?.innerText.trim();
    const carNumberStr = driverCarEl?.innerText.trim();

    const carMatch = carNumberStr?.match(/Car\s*(\d+)/i);
    const carNumber = carMatch ? carMatch[1] : "0";

    driverNameEl.style.display = "none";
    driverCarEl.style.display = "none";

    const editForm = document.createElement("div");
    editForm.className = "edit-form";
    editForm.style.display = "flex";
    editForm.style.alignItems = "center";
    editForm.style.gap = "10px";
    editForm.style.position = "relative";
    editForm.style.zIndex = "1";

    const nameInput = document.createElement("input");
    //nameInput.id = "";
    nameInput.className = "race-driver-name";
    nameInput.type = "text";
    nameInput.value = driverNameOld || "";
    //nameInput.style.padding = "5px";

    const carSelect = document.createElement("select");
    carSelect.style.padding = "10px";

    for (let i = 1; i <= 8; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.text = `Car ${i}`;
        if (i.toString() === carNumber) {
            option.selected = true;
        }
        carSelect.appendChild(option);
    }

    const saveBox = document.createElement('div');
    saveBox.className = 'save inner-box-small';

    const saveImg = document.createElement('img');
    saveImg.className = 'icon-small';
    saveImg.src = '/img/saveIcon.png';
    saveBox.appendChild(saveImg);
    saveBox.addEventListener("click", () => {
        const driverNameNew = nameInput.value.trim();
        const carNumberStr = +carSelect.value;
        editForm.remove();
        saveBox.remove();
        driverNameEl.style.display = "";
        driverCarEl.style.display = "";
        updateDriver(sessionName, driverNameOld, driverNameNew, carNumberStr);
    });

    editForm.appendChild(nameInput);
    editForm.appendChild(carSelect);
    
    driverBox.appendChild(saveBox);
    driverBox.appendChild(editForm);
}

function updateDriver(sessionName, driverNameOld, driverNameNew, carNumber) {
    if(sessionName && driverNameOld && driverNameNew && carNumber) {
        socket.emit('raceSession:driver:update', { sessionName: sessionName, driverNameOld: driverNameOld, driverNameNew : driverNameNew, carNumber: carNumber });
    }
}

function createRaceDriverBox(raceSessionName, driverName, carNumber) {
    const raceSessionElements = document.querySelectorAll(".race-session");
    let foundElement = null;

    for (const element of raceSessionElements) {
        const sessionNameEl = element.querySelector(".race-session-name");
        if (!sessionNameEl) continue;

        const sessionName = sessionNameEl.innerText;
        if (sessionName.trim().toLowerCase() === raceSessionName.trim().toLowerCase()) {
            foundElement = element;
            break;
        }
    }

    if (!foundElement) {
        return;
    }

    const driversContainer = foundElement.querySelector(".drivers-container");
    if (!driversContainer) {
        return;
    }

    const driverItem = document.createElement('div');
    driverItem.className = "drivers-box";

    const nameText = document.createElement('p');
    nameText.className = "driverName";
    nameText.textContent = driverName;
    nameText.style.fontSize = '18px';

    const carNumberText = document.createElement('p');
    carNumberText.className = "driverCarNumber";
    carNumberText.textContent = " - Car " + carNumber;
    carNumberText.style.fontSize = '18px';

    driverItem.appendChild(nameText);
    driverItem.appendChild(carNumberText);

    const numberBox = document.createElement('div');
    numberBox.className = 'inner-box-small driver-number';

    const numberText = document.createElement('p');
    numberText.textContent = carNumber; // Corrected!
    numberText.style.fontSize = '18px';

    numberBox.appendChild(numberText);
    driverItem.appendChild(numberBox);

    const deleteBox = document.createElement('div');
    deleteBox.className = 'delete inner-box-small';
    deleteBox.style.height = '55px';
    deleteBox.style.width = '60px';
    deleteBox.addEventListener("click", removeDriver);

    const deleteImg = document.createElement('img');
    deleteImg.className = 'icon-small';
    deleteImg.src = '/img/deleteIcon.png';
    deleteBox.appendChild(deleteImg);
    driverItem.appendChild(deleteBox);

    const editBox = document.createElement('div');
    editBox.className = 'edit1 inner-box-small';
    editBox.style.height = '55px';
    editBox.style.width = '60px';
    //editBox.style.right = '60px';
    editBox.addEventListener("click", editDriver);

    const editImg = document.createElement('img');
    editImg.className = 'icon-small';
    editImg.src = '/img/editIcon.png';
    editBox.appendChild(editImg);
    driverItem.appendChild(editBox);

    driversContainer.appendChild(driverItem);
}

function updateRaceDriverBox(sessionName, driverNameOld, driverNameNew, carNumber) {
    const allSessions = document.querySelectorAll('.race-session');

    for (const session of allSessions) {
        const sessionNameEl = session.querySelector('.race-session-name');
        if (!sessionNameEl) continue;

        if (sessionNameEl.innerText.trim().toLowerCase() === sessionName.trim().toLowerCase()) {
            const drivers = session.querySelectorAll('.drivers-box');

            for (const driverBox of drivers) {
                const nameEl = driverBox.querySelector('.driverName');
                if (!nameEl) continue;

                if (nameEl.innerText.trim().toLowerCase() === driverNameOld.trim().toLowerCase()) {
                    nameEl.innerText = driverNameNew;

                    const carEl = driverBox.querySelector('.driverCarNumber');
                    if (carEl) {
                        carEl.innerText = ` - Car ${carNumber}`;
                    }

                    const numberBox = driverBox.querySelector('.driver-number p');
                    if (numberBox) {
                        numberBox.innerText = carNumber;
                    }

                    const editForm = driverBox.querySelector('.edit-form');
                    const saveButton = driverBox.querySelector('.save');
                    if (editForm) editForm.remove();
                    if (saveButton) saveButton.remove();

                    nameEl.style.display = '';
                    if (carEl) carEl.style.display = '';

                    return;
                }
            }
        }
    }
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
            const nextElement = box.nextElementSibling;
            if (nextElement && nextElement.classList.contains('drivers-container')) {
                nextElement.remove();
            } else {
                const form = createRaceDriversBox(raceSession.drivers);
                box.insertAdjacentElement('afterend', form);
            }
            break;
        }
    }
});

socket.on('raceSession:delete:success', ({ sessionName }) => {
    deleteRaceBox(sessionName);
});

socket.on('race:update', (raceTrackState) => {
    const currentRaceName = raceTrackState.currentRace.sessionName;
    deleteRaceBox(currentRaceName);
});

socket.on('raceSession:driver:add:success', ({ sessionName, driverName, carNumber }) => {
    createRaceDriverBox(sessionName, driverName, carNumber);
});

socket.on('raceSession:driver:remove:success', ({ sessionName, driverName }) => {
    deleteRaceDriverBox(sessionName, driverName);
});

socket.on('raceSession:driver:update:success', ({ sessionName, driverNameOld, driverNameNew, carNumber }) => {
    updateRaceDriverBox(sessionName, driverNameOld, driverNameNew, carNumber);
});

//HANDLE FAILURES

socket.onAny((event, msg) => {
    if (event.endsWith(':failure') && msg?.error) {
        showError(msg.error);
    }
});