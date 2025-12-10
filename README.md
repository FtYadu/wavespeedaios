# AI Chat Interface Application

A full-stack mobile-optimized AI chat interface built with Next.js (frontend) and NestJS (backend) that integrates with the WaveSpeed AI API.

## Features

- 🔐 Secure user authentication with NextAuth.js
- 🔑 API key management (stored securely on backend)
- 💬 Real-time chat interface with message history
- 🤖 WaveSpeed AI API integration
- 📱 Mobile-optimized responsive design
- 🎛️ Configurable AI model parameters
- 📊 Chat history persistence
- 📈 Prediction history drawer with live filters + streaming endpoint visibility
- 📋 Quick-copy controls and improved input guidance
- 🔒 Comprehensive security measures
- 📚 Auto-generated API documentation

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- Material-UI (MUI) for components
- NextAuth.js for authentication
- Axios for API calls
- Tailwind CSS for styling

### Backend
- NestJS with TypeScript
- PostgreSQL database
- Prisma ORM
- Swagger/OpenAPI documentation
- JWT authentication
- Rate limiting

### Deployment
- Frontend: Vercel
- Backend: Railway/Heroku/AWS
- Database: Supabase/Neon/Railway

## Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── components/          # React components
│   ├── pages/              # Next.js pages
│   ├── styles/             # CSS and styling
│   ├── utils/              # Utility functions
│   └── public/             # Static assets
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── wavespeed/      # WaveSpeed AI integration
│   │   ├── chat/           # Chat history module
│   │   ├── user/           # User management
│   │   └── prisma/         # Database schema
│   └── test/               # Test files
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- WaveSpeed AI API key

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Configure database
5. Run development servers

Detailed setup instructions are provided in the respective frontend and backend directories.

## Security Considerations

- API keys stored securely on backend only
- WaveSpeed API keys are encrypted at rest using AES-256-GCM (set `API_KEY_ENCRYPTION_KEY`)
- Input validation and sanitization
- Rate limiting to prevent abuse
- HTTPS enforcement
- CSRF protection
- XSS prevention
- Secure session management

## WaveSpeed Integration

- Configure `WAVESPEED_API_KEY`, `WAVESPEED_API_URL`, and a 32-byte `API_KEY_ENCRYPTION_KEY`
- Backend proxies all WaveSpeed traffic and logs API call metrics
- Frontend fetches model metadata dynamically so new providers become available without redeploys
- Use `/api/wavespeed/predictions` to inspect recent inference jobs (surfaced in the UI drawer) and `/api/wavespeed/streaming/models` to discover SSE-capable models (displayed alongside the prediction history)

## Testing

- **Backend**: `cd backend && npm install && npm run test`
- **Frontend**: `cd frontend && npm install && npm run test`

Both test suites use Jest (NestJS for backend, `next/jest` for frontend utilities).

## Deployment (Netlify)

The repository ships with a `netlify.toml` configured for the Next.js frontend:

1. Create a Netlify site and point it at this repository.
2. Set environment variables (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `BACKEND_URL`, etc.) in the Netlify dashboard.
3. Ensure the WaveSpeed secrets (`WAVESPEED_API_KEY`, `API_KEY_ENCRYPTION_KEY`) are also present.
4. Trigger a deploy – Netlify runs `npm run build` inside `frontend/` (for production, preview, and branch deploy contexts) and publishes `.next` via `@netlify/plugin-nextjs`.

## License

MIT License
