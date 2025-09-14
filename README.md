# Racetrack Info Screens

## Overview
Beachside Racetrack needs a system to manage races and provide real-time information to spectators and employees.  
The system uses Node.js and Socket.IO to ensure all interfaces and displays react instantly to events.

---

## Core Features (MVP)
- **Race Management**
  - Add, remove, and edit race sessions
  - Add and remove race drivers
  - Car assignment to drivers
- **Real-time Control**
  - Change race mode (Safe, Hazard, Danger, Finish)
  - Start and finish races
- **Lap Tracking**
  - Lap-line Observer records when cars cross the lap line
  - Leaderboard and employee interfaces show fastest lap times
- **Public Displays**
  - Leaderboard (fastest lap times)
  - Next Race (upcoming drivers and cars)
  - Race Countdown (timer for current race)
  - Race Flags (current race mode)

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

Clone repository

```bash
git clone https://gitea.kood.tech/martinhiiesalu/racetrack
```
Navigate to repository
```bash
cd racetrack
```
Before starting the server, set the required keys to repository root .env file:

```bash
export receptionist_key=8ded6076
export observer_key=662e0f6c
export safety_key=a2d393bc
```

Install dependencies and start server

```bash
npm install
```
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
http://<YOUR LOCAL IP>:3000
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
