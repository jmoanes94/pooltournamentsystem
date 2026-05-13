# Wednesday 8-Ball — Tournament Signup System

Professional, mobile-first **Wednesday tournament signup** with **React + Tailwind** on the frontend and **Node.js + Express + Socket.io** on the backend. No database, no accounts: the server keeps the live board in memory while browsers persist **notifications** and **remembered player names** in **LocalStorage**.

## Features

| Area | Behavior |
|------|-----------|
| **Schedule** | Registration **opens Wednesdays 11:00 AM – 10:00 PM** (server local time). Outside that window signup is disabled and the countdown targets the next open time. |
| **Capacity** | **16** approved slot holders; extra approved players go to an **ordered waitlist** with visible **#position**. |
| **Signup** | **Player name only** → **pending** until an admin **approves** (slot or waitlist) or **rejects**. |
| **Duplicates** | Same name (case-insensitive, trimmed) cannot exist in pending, slots, waitlist, or rejected for the current week. |
| **Admin** | `/admin` — password gate (env `ADMIN_PASSWORD`, demo default `admin123`), approve/reject, remove from slot (auto-promotes waitlist), remove from waitlist, **full reset**. |
| **Realtime** | All clients receive **`tournament:state`** on every change. |
| **Notifications** | Socket events **`notify:admin`** / **`notify:player`** merged into **LocalStorage** with **unread badge** on the bell. |
| **Auto reset** | Every **Wednesday at or after 10:00 PM**, the server clears slots, waitlist, pending, and rejected once per calendar Wednesday (idempotent key). Clients receive **`tournament:reset`** and **clear saved notifications**. |

## Folder structure

```text
PoolTournamentSystem/
├── package.json                 # root: concurrently dev script
├── README.md
├── server/
│   ├── package.json
│   ├── index.js                 # Express + Socket.io wiring
│   ├── schedule.js              # Wednesday window + weekly reset key
│   └── tournamentState.js       # in-memory lists + mutations
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── SocketContext.jsx
        ├── components/
        │   ├── EightBallLogo.jsx
        │   ├── Navbar.jsx
        │   ├── CountdownTimer.jsx
        │   ├── SignupForm.jsx
        │   ├── PlayerSlotsGrid.jsx
        │   ├── WaitlistPanel.jsx
        │   └── NotificationBell.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   └── AdminPage.jsx
        └── utils/
            ├── storage.js
            ├── sound.js
            └── playerStatus.js
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   npm run install:all
   ```

   The first command installs the root helper (`concurrently`). The second installs `server/` and `client/`.

2. **Environment (optional)**

   - **Server**: copy `server/.env.example` to `server/.env` and set `ADMIN_PASSWORD`, `PORT`, `CLIENT_ORIGIN` if needed.
   - **Client**: copy `client/.env.example` to `client/.env` and set `VITE_SOCKET_URL` if the API is not on `http://localhost:3001`.

3. **Run development** (starts API + Vite):

   ```bash
   npm run dev
   ```

   - App: `http://localhost:5173`
   - API + WebSocket: `http://localhost:3001`

4. **Production build** (static client + run server):

   ```bash
   npm run build
   npm run start
   ```

   Serve `client/dist` with any static host and point `CLIENT_ORIGIN` / CORS to that origin; set `VITE_SOCKET_URL` at build time to your public API URL.

## Run commands (cheat sheet)

| Command | Purpose |
|---------|---------|
| `npm run install:all` | Install server + client dependencies |
| `npm run dev` | Dev: Socket.io server + Vite HMR |
| `npm run build` | Production bundle for `client/dist` |
| `npm run start` | Run Node server only |

## UI mockup (wire layout)

```text
┌──────────────────────────────────────────────────────────────────┐
│  🎱  Wednesday 8-Ball Open          [ Live ] [ 🔔3 ] [ Admin ]     │
│      Registration opens every Wednesday at 11:00 AM               │
├──────────────────────────────────────────────────────────────────┤
│  HERO + copy                    │  COUNTDOWN (glass card)          │
│  [ Signup: name + CTA ]         │  D : H : M : S                   │
├──────────────────────────────────────────────────────────────────┤
│  12 / 16 Slots Filled   ·   Waitlist when full                    │
├──────────────────────────────────────────────────────────────────┤
│  YOUR STATUS  (green / yellow / red badge)                        │
├──────────────────────────────────────────────────────────────────┤
│  ACTIVE TABLES 4x4 grid (#1-#16, neon “In” pill)                 │
├──────────────────────────────────────────────────────────────────┤
│  WAITLIST  (#order, “Waiting” pill)                               │
├──────────────────────────────────────────────────────────────────┤
│  AWAITING REVIEW  (amber chips)                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Security note

Admin auth is a **shared password** over Socket.io — suitable for trusted local / LAN ops. For production on the public internet, put the API behind HTTPS, rotate secrets, and replace this with real auth.

## Stack

- **Client:** React 18, React Router 6, Tailwind CSS 3, Socket.io-client, react-hot-toast  
- **Server:** Node 18+, Express, Socket.io, CORS  

---

Built as a compact **esports-style** desk with **felt + neon** visuals and **8-ball** header branding.
