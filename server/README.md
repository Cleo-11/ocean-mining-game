# Ocean Mining Multiplayer Server

This is the backend server for the Ocean Mining multiplayer game.

## Deployment to Render

1. Push this server folder to a GitHub repository
2. Connect the repository to Render
3. Set the following configuration:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node.js
   - **Port:** Use the PORT environment variable

## Environment Variables

Set these in your Render dashboard:

- `NODE_ENV=production`
- `FRONTEND_URL=https://your-vercel-app.vercel.app`

## Health Check

The server provides a health check endpoint at `/health` for monitoring.
