# SelfProductive

A mobile-first daily habit tracker. Google sign-in, Firebase Firestore sync (offline-first), installable as a PWA.

**Default habits:** gym · steps (10,000 = 100%) · water (3 L) · sunscreen · early wake-up · learned something new.
Add your own from the **Today** or **Habits** tab: a Yes/No habit, or a Target habit with a goal, unit and step size.
Habits can be edited, reordered (drag the handle) and deleted.

**Stack:** React 18 + TypeScript + Vite · Framer Motion · Lucide icons · Firebase Auth + Firestore · vite-plugin-pwa

**Design:** warm paper and ink palette with a single deep-green accent, Instrument Serif + Inter (bundled in `public/fonts`, works offline), and automatic light/dark mode. Design tokens live at the top of `src/styles.css`.

## 1. Firebase setup (one-time, ~5 minutes)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable** (pick a support email).
3. **Build → Firestore Database → Create database** (production mode, nearest region).
4. **Project settings → Your apps → Web (`</>`)** → register an app and copy the config.
5. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
6. Deploy the security rules (each user can only touch their own data):
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use --add          # pick your project
   firebase deploy --only firestore:rules
   ```

## 2. Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (also reachable from your phone on the same Wi-Fi)
```

`localhost` is already an authorised Auth domain. Testing from your phone over the LAN IP needs that IP added under
**Authentication → Settings → Authorized domains**.

## 3. Ship it (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

Then add your live domain (`<project>.web.app` is added automatically) to **Authorized domains** if you use a custom one.
Open the site on your phone and use **Add to Home Screen** (iOS) or **Install app** (Android/Chrome).

> Sign-in uses a popup and falls back to a redirect where popups are blocked (some installed-PWA contexts).
> For the redirect flow to work reliably in every browser, set `VITE_FIREBASE_AUTH_DOMAIN` to the domain you serve the app from.

## Data model

```
users/{uid}                       { seeded, createdAt }
users/{uid}/habits/{habitId}      { name, icon, color, kind: 'check'|'progress', target, unit, step, order, createdDate }
users/{uid}/logs/{YYYY-MM-DD}     { values: { [habitId]: number }, updatedAt }
```

A day's score is the average completion of every habit that existed on that day. A streak counts days at 80% or more
(`STREAK_THRESHOLD` in `src/lib/score.ts`). The last 365 days of logs are loaded.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build (with service worker) |
| `npm run preview` | Serve the production build locally |
