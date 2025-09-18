# Racetrack Info Screens

## Overview
Beachside Racetrack needs a system to manage races and provide real-time information to spectators and employees.  
The system uses Node.js and Socket.IO to ensure all interfaces and displays react instantly to events.

---

## Core Features (MVP)
- **Receptionist (Front Desk)**
  - Add, remove, and edit race sessions
  - Add and remove race drivers
  - Car assignment to drivers (automatic assigne if user didn't assigne manually)
- **Safety Official (Race Control)**
  - Start Race and send notification to other front-end pages
  - Change race mode (Safe, Hazard, Danger, Finish)
  - Start and finish races
- **Lap-line Tracker (Lap-line Observer)**
  - Lap-line Observer records when cars cross the lap line
  - Leaderboard and employee interfaces show fastest lap times and current lap
- **Public Displays**
  - Leaderboard (fastest lap times)
  - Next Race (upcoming drivers and cars)
  - Race Countdown (timer for current race)
  - Race Flags (current race mode)
- **Error handling**
  - Project has error handling for every user case.
---

## User Interfaces

### Employee Interfaces (admin password required)
| Interface          | Persona            | Route            |
|--------------------|--------------------|------------------|
| Front Desk         | Receptionist       | /front-desk      |
| Race Control       | Safety Official    | /race-control    |
| Lap-line Tracker   | Lap-line Observer  | /lap-line-tracker|

### Public Displays
| Interface        | Persona       | Route               |
|------------------|---------------|---------------------|
| Leader Board     | Guest         | /leader-board       |
| Next Race        | Race Driver   | /next-race          |
| Race Countdown   | Race Driver   | /race-countdown     |
| Race Flags       | Race Driver   | /race-flags         |



---

## Server Setup

1. Clone repository

```bash
git clone https://gitea.kood.tech/martinhiiesalu/racetrack
```
2. Navigate to repository
```bash
cd racetrack
```
3. Before starting the server, set the required keys to repository root .env file (create new .env file):

```bash
export PORT=3000
export NODE_ENV=development
export NODE_ENV=production
export receptionist_key=8ded6076
export observer_key=662e0f6c
export safety_key=a2d393bc
```

4. Install dependencies and start server

```bash
npm install
```
5. Start the server
Use npm start for production environment
```bash
npm start
```
or npm run dev or development environment
```bash
npm run dev
```
The server will run on your local machine. To access from another device on the same WiFi, use your local IP that is printed to console:
```bash
http://<YOUR LOCAL IP>:PORT
```

6. Expose your server to the public network using ngrok

6.1 Download ngrok from: https://ngrok.com/downloads/ (options to download manually or via terminal command)
6.2 Register your account if needed
6.3 Navigate to "Setup & Installation" and find following command to add auth-token
```
ngrok config add-authtoken <YOUR-AUTH-TOKEN>
```
6.4 Put your app online (make sure application is running locally). Change PORT (:3000) if .env has other PORT variable. 
Run command:
´´´
ngrok http http://localhost:3000
´´´

You should see link to your application in consloe. It looks like this:
```
https://o4cb541cb612.ngrok-free.app/
```

## Technology
- **Node.js** – server runtime  
- **Express** – HTTP server and routing  
- **Socket.IO** – real-time communication between server and clients  
- **dotenv** – manage environment variables  
- **cookie & cookie-parser** – handle cookies  
- **cross-env** – set environment variables cross-platform  

## Authors

- Martin Hiiesalu – [martinhiiesalu](https://gitea.kood.tech/martinhiiesalu)  
- Rainer Lestal – [rainerlestal](https://gitea.kood.tech/rainerlestal)  
- Andero Schütz – [anderoschutz](https://gitea.kood.tech/anderoschutz)
