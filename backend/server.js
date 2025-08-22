
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import "dotenv/config.js";
import cookieParser from 'cookie-parser';
import cookie from 'cookie';
import { handleLapTracking } from './lapTracker.js';

import { nextRaceLogic } from './nextRace.js';
import { raceControl } from './raceControl.js';

import { raceTrackState } from './state.js';


const app = express();
const server = createServer(app);
// const port = process.env.PORT;
const port = 3000;


const io = new Server(server, {
  connectionStateRecovery: {}
});

let RECEPTIONIST_SESSION_TOKEN = 'receptionist_token';

const SAFETY_KEY = "test";


const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cookieParser());

// Soo that we could use css js
app.use('/css', express.static(join(__dirname, '../frontend/css')));
app.use('/js', express.static(join(__dirname, '../frontend/js')));

//Server Routes
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/public/index.html'));
});

app.get('/front-desk', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/private/front-desk.html'));
});

app.get('/race-control', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/private/race-control.html'));
});

app.get('/lap-line-tracker', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/private/lap-line-tracker.html'));
});

app.get('/leader-board', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/public/leader-board.html'));
});

app.get('/next-race', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/public/next-race.html'));
});

app.get('/race-countdown', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/public/race-countdown.html'));
});

app.get('/race-flags', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/html/public/race-flags.html'));
});

function validateReceptionistToken() {
    return RECEPTIONIST_SESSION_TOKEN === process.env.RECEPTIONIST_KEY;
}

//Server Logic
io.on('connection', (socket) => {

    //HANDLE LOGIN SESSIONS
    const rawCookie = socket.handshake.headers.cookie;
    if (rawCookie) {
        const parsedCookies = cookie.parse(rawCookie);
        const receptionistToken = parsedCookies.receptionist_token;
        RECEPTIONIST_SESSION_TOKEN = receptionistToken;
        if(receptionistToken) {
            if (receptionistToken === process.env.RECEPTIONIST_KEY) {
                socket.emit('login', { persona: 'Receptionist', status: true, cookie: true });
            }
        }
    }

    // HANDLE LOGIN LOGIC
    socket.on('login', (msg) => {
        const persona = msg.persona;
        const token = msg.token;
        if(persona === "Receptionist") {
            if(token === process.env.RECEPTIONIST_KEY) {
                socket.emit('login', { persona: persona, status: true });
            }else {
                // Wait 0.5 Sec
                setTimeout(() => {
                    socket.emit('login', { persona: persona, status: false });
                }, 500);
            }
        }
        if(persona === "RaceControl") {
            if(token === SAFETY_KEY) {
                socket.emit('login', { persona, status: true });
            } else {
            setTimeout(() => {
                socket.emit('login', { persona, status: false });
            }, 500);
        }
    }
    });
    
    // HANDLE Receptionist Server Logic
    socket.on('raceSession:create', (nextRaceSessionName) => {
        console.log(nextRaceSessionName)
        //ADD CHECK FOR AUTHORIZATION
        //CHECK FOR DUPLICATE NAME
        raceTrackState.upComingRaces.push(
            {
                sessionName : nextRaceSessionName,
                drivers : [],
                durationSeconds : 30
            }
        )
        // console.log(nextRaceSessionName);
        socket.emit('raceSession:create:success', nextRaceSessionName);
    });

    // LAP COMPLETION EVENT
    handleLapTracking(io, socket);

raceControl(io, socket)
nextRaceLogic(io, socket);

});


//Server Start
server.listen(port, () => {
    console.log('server running at http://localhost:' + port);
});