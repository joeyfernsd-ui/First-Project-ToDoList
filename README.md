# TaskBoard

TaskBoard is a simple responsive to-do list built with Next.js. Tasks are saved
in the browser using local storage, so no account or database is required.

## Run locally

On Windows, double-click `Start TaskBoard.bat`, or run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

Import this GitHub repository into Vercel and use the standard Next.js defaults:

- Framework Preset: Next.js
- Build Command: leave at the default (`npm run build`)
- Output Directory: leave blank
- Root Directory: repository root

Task data is local to each browser and does not synchronize between devices.

