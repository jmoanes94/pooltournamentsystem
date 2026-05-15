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

4. **Production (Vercel static site + Node API elsewhere)**

   Vercel only serves `client/dist`. The **Socket.io server must run** on Render, Railway, Fly.io, a VPS, etc.

   1. **Vercel (client)** — Project → Settings → Environment variables:
      - `VITE_SOCKET_URL` = your API’s public origin, **`https://...`** (must match TLS; no `http://` from an `https://` Vercel page).
      - Redeploy after saving (Vite bakes this in at build time).

   2. **API host (server)** — In that service’s env:
      - `CLIENT_ORIGIN` = comma list of allowed browser origins, e.g. `http://localhost:5173,https://your-app.vercel.app`
      - **Or** set `CORS_ALLOW_VERCEL_PREVIEW=true` to allow any `https://*.vercel.app` preview URL (optional; tighten for strict production).
      - `ADMIN_PASSWORD` = organizer password.

   3. **Local production check**

   ```bash
   npm run build
   npm run start
   ```

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

## Git and GitHub

This folder is a normal Git repo. **Current remote:** `origin` → `https://github.com/jmoanes1/pooltournamentsystem.git`.

| Goal | What to do |
|------|----------------|
| **Send your latest work** | `git add -A` → `git commit -m "Describe your change"` → `git push origin main` |
| **Check the connection** | `git fetch origin` (no output usually means OK) |
| **Use a different GitHub repo** | Create the empty repo on GitHub, then: `git remote set-url origin https://github.com/YOU/NEW-REPO.git` then `git push -u origin main` |
| **Windows: fix “auth failed” / reconnect sign-in** | Open **Credential Manager** → **Windows Credentials** → remove old `github.com` entries, then push again and sign in. Or use a [Personal Access Token](https://github.com/settings/tokens) as the password when Git prompts you. |
| **Start completely fresh on GitHub** (destructive) | Create a **new** empty repository, set `origin` to it as above, then `git push -u origin main`. To replace all history with one new commit locally first, search for “git orphan branch single commit”; only do this if you understand `git push --force`. |

Your machine currently shows **branch `main` in sync with `origin/main`** and a **clean** working tree, so there is nothing new to push until you change files and commit again.

## Security note

Admin auth is a **shared password** over Socket.io — suitable for trusted local / LAN ops. For production on the public internet, put the API behind HTTPS, rotate secrets, and replace this with real auth.

## Stack

- **Client:** React 18, React Router 6, Tailwind CSS 3, Socket.io-client, react-hot-toast  
- **Server:** Node 18+, Express, Socket.io, CORS  

---

Built as a compact **esports-style** desk with **felt + neon** visuals and **8-ball** header branding.
