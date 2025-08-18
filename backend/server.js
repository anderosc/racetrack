
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import "dotenv/config.js";
import cookieParser from 'cookie-parser';
import cookie from 'cookie';

const app = express();
const server = createServer(app);
// const port = process.env.PORT;
const port = 3000;


const io = new Server(server, {
  connectionStateRecovery: {}
});

const Receptionist_SESSION_TOKEN = 'receptionist_token';
const SAFETY_KEY = "test";

let raceSession = null; // current session
let timerInterval = null;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cookieParser());

// Soo that we could use css stylesheet
app.use(express.static(join(__dirname, '../frontend/css/public')));

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

    //HANDLE LOGIN SESSIONS
    const rawCookie = socket.handshake.headers.cookie;
    if (rawCookie) {
        const parsedCookies = cookie.parse(rawCookie);
        const receptionistToken = parsedCookies.receptionist_token;
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
        let nextRaceSessionName
    // HANDLE Receptionist Server Logic
    socket.on('raceSession:create', (nextRaceSessionName) => {
        //ADD CHECK FOR AUTHORIZATION
        //CHECK FOR DUPLICATE NAME
        raceSession = {
            raceName : nextRaceSessionName
        }
        console.log(nextRaceSessionName);
        socket.emit('raceSession:create:success', nextRaceSessionName);
    });


// ------ race-control logic ------
  socket.on('race:start', () => {
    if (raceSession){
        return;
    }

    //example object for testing (variable raceSession) - can be deleted later
    raceSession = {
      drivers: [
        { name: "Alice", car: 1 },
        { name: "Bob", car: 2 },
        { name: "Charlie", car: 3 },
      ],
      mode: "Safe",
      duration: 60,
      remainingTime: 60
    };

    // Timer loop - updates every second. 60 second development
    // TODO -> 10min for "npm run dev" and 60second for "npm start"
    timerInterval = setInterval(() => {
      if (!raceSession){
        return;
      }

      raceSession.remainingTime = raceSession.remainingTime - 1;

      if (raceSession.remainingTime <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        raceSession.remainingTime = 0;
        raceSession.mode = "Finish";
      }

      io.emit("state:update", { currentSession: raceSession });
    }, 1000);

    io.emit("state:update", { currentSession: raceSession });
  });

  // Change mode, sent from race-control. Saved into object
  socket.on('race:changeMode', ({ mode }) => {
    if (raceSession) {
      raceSession.mode = mode;
      io.emit("state:update", { currentSession: raceSession });
    }
  });

  // End session for all.
  socket.on('race:endSession', () => {
    raceSession = null;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = null;
    io.emit("state:update", { currentSession: null });
  });
// ---- race control logic end ---


// ---- Next Race logix
    raceSession = {
        raceName : nextRaceSessionName
    }


// Send data of next race
socket.on("nextRace:get", () => {
    socket.emit("nextRace:update", raceSession);
    console.log(raceSession)
});
/// -----


});


//Server Start
server.listen(port, () => {
    console.log('server running at http://localhost:' + port);
});