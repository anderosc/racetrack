
import express from 'express';
import os from 'os';

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

const requiredEnvVars = ['receptionist_key', 'observer_key', 'safety_key'];

const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
    console.error(`❌ Error: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('\nUsage:\n');
    console.error('  export receptionist_key=8ded6076');
    console.error('  export observer_key=662e0f6c');
    console.error('  export safety_key=a2d393bc');
    console.error('\nThen run:\n');
    console.error('  npm start');
    process.exit(1); // Stop the server from starting
}

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

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
        const lapLineTrackerToken = parsedCookies.lapLineTracker_token;
        if (receptionistToken === process.env.receptionist_key) {
            socket.emit('login', { persona: 'receptionist', status: true, cookie: true });
            socket.join('receptionist');
            socket.emit('raceList', raceTrackState.upComingRaces);
        }
        if (raceControlToken === process.env.safety_key) {
            socket.emit('login', { persona: 'raceControl', status: true, cookie: true });
            socket.join('raceControl');
        }
        if (lapLineTrackerToken === process.env.observer_key) {
            socket.emit('login', { persona: 'lapLineTracker', status: true, cookie: true });
            socket.join('lapLineTracker');
        }
    }

    // HANDLE LOGIN LOGIC
    socket.on('login', (msg) => {

        const persona = msg.persona;
        const token = msg.token;

        if(persona === "receptionist") {
            if(token === process.env.receptionist_key) {
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
            if(token === process.env.safety_key) {
                socket.emit('login', { persona: persona, status: true });
                socket.join('raceControl');
            }else {
                setTimeout(() => { 
                    socket.emit('login', { persona: persona, status: false });
                }, 500);
            }
        }
        if(persona === "lapLineTracker") {
            if(token === process.env.observer_key) {
                socket.emit('login', { persona: persona, status: true });
                socket.join('lapLineTracker');
            } else {
                setTimeout(() => { 
                    socket.emit('login', { persona: persona, status: false });
                }, 500);
            }
        }
    });

    socket.on('race:requestState', () => {
        socket.emit('state:update', raceTrackState);
    })

    //RACE SESSIONS LOGIC
    raceSessions(io, socket);

    // LAP COMPLETION EVENT
    handleLapTracking(io, socket, raceTrackState);

    raceControl(io, socket)
    nextRaceLogic(io, socket);

});

    function getLocalIP() {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const intf of interfaces[name]) {
                if (intf.family === 'IPv4' && !intf.internal) {
                    return intf.address.toString();
                }
            }
        }
    }

//Server Start
server.listen(port, '0.0.0.0', () => {
    console.log('server running at http://localhost:' + port)
    console.log(`Server running at http://${getLocalIP()}:${port}`);
});