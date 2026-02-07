# DateKeeper

A Next.js + Firebase app for tracking milestones, countdowns, and reminders with image-backed cards and PWA support.

## Tech Stack

- Next.js App Router
- React + TypeScript
- Firebase Auth, Firestore, and Storage
- TanStack Query
- Tailwind CSS + Radix UI
- next-pwa (service worker + offline fallback)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with Firebase web config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

- `npm run dev`: start local dev server
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks
- `npm run build`: build production bundle
- `npm run verify`: lint + typecheck + build

## Firebase Config In Repo

- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Storage rules: `storage.rules`
- Firebase project wiring: `firebase.json`

## Notes

- PWA is disabled in `development` and enabled for production builds.
- Service worker assets in `public/` are generated at build time.
