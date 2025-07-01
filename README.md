This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

This app is basically a Tinder for restaurants. Start a matching session and share the link with a friend. You'll both vote on restuarants until you both like the same restaurant, then you'll both know where you're going for dinner!

### Highlights

- Votes are updated in realtime via a socket connection. As soon as a match is determined, both users are notified instantly.
- Uses the Yelp Fusion API to find restaurants near a given location
- Location can be determined by `window.navigator` (if the user gives permission), IP address, or by moving the pin on an interactive Google map.

**Sessions are public - anyone with the link can join a session, assuming there aren't already two users joined**

## Getting Started

### Environment Variables

You will need a `.env` with values for:

- [Turso](https://turso.tech/) database URL
  - You just need to create an empty database to start. Read on for migration & seeding details
- Turso auth token
- [Google Maps API Key](https://console.cloud.google.com/apis/credentials)
  - You'll want to enable [Places API (new)](https://console.cloud.google.com/apis/library/places.googleapis.com) and [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)

`.env` keys:

```
YELP_API_KEY=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_API_ROOT=http://localhost:3000
```

### Setup the Database

Once you have your .env file created and populated, run `npm run db:migrate`. This should create the appropriate tables and columns. You can see the schema in `./src/lib/db/schema.ts`.

### Run It!

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
