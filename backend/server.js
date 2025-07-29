
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

//Server Start
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});