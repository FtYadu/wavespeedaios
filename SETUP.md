# Quick Setup Guide

This guide will help you set up the AI Chat Interface application locally and get it running quickly.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- WaveSpeed AI API key
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-chat-interface
```

### 2. Backend Setup

#### Navigate to backend directory:
```bash
cd backend
```

#### Install dependencies:
```bash
npm install
```

#### Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_chat_db"

# JWT
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRATION=7d

# WaveSpeed AI
WAVESPEED_API_KEY=your-wavespeed-api-key
WAVESPEED_API_URL=https://api.wavespeed.ai/v1
API_KEY_ENCRYPTION_KEY=32-character-secret-value

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX_REQUESTS=10

# Security
BCRYPT_ROUNDS=10
```

> **Note:** `API_KEY_ENCRYPTION_KEY` must be exactly 32 bytes (e.g., generate with `openssl rand -hex 16`) so that the backend can encrypt stored WaveSpeed API keys.

#### Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

#### Start the backend server:
```bash
# Development mode
npm run start:dev

# Or production build
npm run build
npm run start:prod
```

The backend should be running at `http://localhost:3001`

### 3. Frontend Setup

#### Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

#### Install dependencies:
```bash
npm install
```

#### Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` file:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
BACKEND_URL=http://localhost:3001
```

#### Start the frontend development server:
```bash
npm run dev
```

The frontend should be running at `http://localhost:3000`

### 4. Test the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Sign Up" to create a new account
3. After registration, you'll be redirected to the login page
4. Sign in with your credentials
5. Start chatting with the AI!

## Development Workflow

### Backend Development

```bash
cd backend
npm run start:dev  # Start with hot reload
npm run test       # Run tests
npm run lint       # Lint code
```

### Frontend Development

```bash
cd frontend
npm run dev        # Start with hot reload
npm run build      # Build for production
npm run lint       # Lint code
```

## Database Management

### View Database
```bash
cd backend
npx prisma studio  # Open Prisma Studio
```

### Create Migration
```bash
cd backend
npx prisma migrate dev --name your-migration-name
```

### Reset Database (Development Only)
```bash
cd backend
npx prisma migrate reset
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check connection string in `.env`
   - Verify database exists

2. **Port Already in Use**
   - Change port in `.env` files
   - Kill process using the port: `lsof -ti:3000 | xargs kill`

3. **Module Not Found**
   - Run `npm install` in both directories
   - Clear npm cache: `npm cache clean --force`

4. **Authentication Issues**
   - Ensure `NEXTAUTH_SECRET` is set
   - Check `JWT_SECRET` in backend
   - Verify backend URL in frontend `.env.local`

### Debug Mode

Enable debug logging:
```bash
# Backend
debug=* npm run start:dev

# Frontend
# Add to .env.local
NEXTAUTH_DEBUG=true
```

## Project Structure

```
ai-chat-interface/
├── frontend/                 # Next.js frontend
│   ├── components/          # React components
│   ├── pages/              # Next.js pages
│   ├── styles/             # CSS files
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   └── public/             # Static assets
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── wavespeed/      # WaveSpeed AI integration
│   │   ├── chat/           # Chat history module
│   │   ├── user/           # User management
│   │   └── prisma/         # Database schema
│   └── test/               # Test files
├── docs/                   # Documentation
└── README.md              # Main documentation
```

## API Documentation

Once the backend is running, you can view the API documentation at:
`http://localhost:3001/api/docs`

## Next Steps

1. **Customize the UI**: Modify components in `frontend/components/`
2. **Add Features**: Extend backend services in `backend/src/`
3. **Deploy**: Follow the [Deployment Guide](DEPLOYMENT.md)
4. **Security Review**: Read the [Security Guide](SECURITY.md)

## Getting Help

- Check the [README.md](README.md) for overview
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment
- Review [SECURITY.md](SECURITY.md) for security best practices
- Check existing issues and discussions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
