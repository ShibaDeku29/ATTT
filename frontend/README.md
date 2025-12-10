# Frontend - Realtime Chat React App

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components
├── context/            # React Context (Auth)
├── services/           # API client
├── types/              # TypeScript types
├── styles/             # Global styles (Tailwind)
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Socket.io Client** - Real-time messaging
- **Axios** - HTTP client

## Features

- User authentication (Register/Login)
- Real-time chat rooms
- Live messaging with Socket.io
- User online status
- Typing indicators
- Responsive design
- Dark theme

## Environment

Connect to backend at `http://localhost:4000`

To change API URL, edit `src/services/api.ts`
