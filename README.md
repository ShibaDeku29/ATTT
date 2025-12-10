# Realtime Chat (Socket.io)

## Setup
1. Install backend deps
   ```bash
   cd backend
   npm install
   ```

2. Run server
   ```bash
   npm start
   # Server listens on PORT env or 4000
   ```

3. Open frontend
   - Open `frontend/index.html` directly in a browser, or serve it with any static server.
   - It connects to `http://localhost:4000` by default.

## Notes
- Set `PORT` in `.env` if you need a different port.
- CORS is open (`*`) for simplicity; tighten it for production.
