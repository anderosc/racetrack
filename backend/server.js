
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
import { raceSessions } from './raceSessions.js';

const app = express();
const server = createServer(app);
// const port = process.env.PORT;
const port = 3000;

const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cookieParser());

// Soo that we could use css js images
app.use('/css', express.static(join(__dirname, '../frontend/css')));
app.use('/js', express.static(join(__dirname, '../frontend/js')));
app.use('/img', express.static(join(__dirname, '../frontend/img')));

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

//Server Logic
io.on('connection', (socket) => {

    //HANDLE LOGIN FROM COOKIE
    const rawCookie = socket.handshake.headers.cookie;
    if (rawCookie) {
        const parsedCookies = cookie.parse(rawCookie);
        const receptionistToken = parsedCookies.receptionist_token;
        const raceControlToken = parsedCookies.raceControl_token;
        if (receptionistToken === process.env.RECEPTIONIST_KEY) {
            socket.emit('login', { persona: 'receptionist', status: true, cookie: true });
            socket.join('receptionist');
            socket.emit('raceList', raceTrackState.upComingRaces);
        }
        if (raceControlToken === process.env.SAFETY_KEY) {
            socket.emit('login', { persona: 'raceControl', status: true, cookie: true });
            socket.join('raceControl');
        }
    }

    // HANDLE LOGIN LOGIC
    socket.on('login', (msg) => {

        const persona = msg.persona;
        const token = msg.token;

        if(persona === "receptionist") {
            if(token === process.env.RECEPTIONIST_KEY) {
                socket.emit('login', { persona: persona, status: true });
                socket.join('receptionist');
                socket.emit('raceList', raceTrackState.upComingRaces);
            }else {
                setTimeout(() => {
                    socket.emit('login', { persona: persona, status: false });
                }, 500);
            }
        }
        if(persona === "raceControl") {
            if(token === process.env.SAFETY_KEY) {
                socket.emit('login', { persona: persona, status: true });
                socket.join('raceControl');
            } else {
            setTimeout(() => { 
                socket.emit('login', { persona: persona, status: false });
            }, 500);
        }
    }
    });

    //RACE SESSIONS LOGIC
    raceSessions(io, socket);

    // LAP COMPLETION EVENT
    handleLapTracking(io, socket);

raceControl(io, socket)
nextRaceLogic(io, socket);

});


//Server Start
server.listen(port, () => {
    console.log('server running at http://localhost:' + port);
});