---
name: run-app
description: Use when the user asks to start, run, launch, or boot up the development server or the application.
---

# Run App Skill

Use this skill whenever the user wants to start or run the application in development mode.

## Steps to launch the application:

1. **Start the Dev Server:**
   Execute the project's development script in the background:
   ```bash
   npm run dev
   ```
   Note: This project is a monorepo that launches both the frontend (Vite) on port `5173` and the backend on port `3000` in parallel using `pnpm --parallel dev`.

2. **Wait for startup:**
   Wait for a few seconds to ensure both servers are listening.

3. **Verify running status:**
   Verify the ports are open and active:
   ```bash
   lsof -i :5173
   lsof -i :3000
   ```
