# DSAMASTER 🚀

> The Ultimate DSA Learning, Tracking, Competition & Mentorship Platform

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS + Framer Motion + Recharts
- **Backend**: Node.js + Express.js + Socket.io
- **Database**: MongoDB Atlas
- **Auth**: Firebase Authentication (Google Sign-In)
- **Email**: Resend
- **Hosting**: Vercel (frontend) + Render (backend)

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Firebase project with Google Auth enabled
- Resend account

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd DsaMaster

# Setup backend
cd server
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run seed    # Seed NeetCode problems
npm run dev

# Setup frontend (new terminal)
cd ../client
cp .env.example .env
# Fill in your Firebase config in .env
npm install
npm run dev
```

## Environment Variables

See `server/.env.example` and `client/.env.example` for all required variables.

## Deployment

- **Frontend**: Connect to Vercel, set env vars, deploy `client/` directory
- **Backend**: Connect to Render, set env vars, deploy `server/` directory
