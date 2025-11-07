# Quick Deployment Guide

## Prerequisites

- Node.js 20+ installed
- npm installed
- Git repository configured

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

### 3. Test Locally

```bash
# Development mode
npm run dev

# Production build test
npm run build
npm run preview
```

### 4. Deploy

#### Option A: Automated Script

```bash
npm run deploy "Your commit message"
```

#### Option B: GitHub Pages (Automatic)

1. Push to main branch
2. GitHub Actions will automatically build and deploy
3. Access at: `https://username.github.io/repository`

#### Option C: Docker

```bash
# Build and run with Docker
docker-compose up -d

# Access at http://localhost:8080
```

## Environment Variables

Minimum required configuration:

```bash
VITE_API_BASE_URL=https://your-api.com/api
```

## Deployment Platforms

### Netlify

- Connect GitHub repository
- Build: `npm run build:prod`
- Publish: `dist`

### Vercel

- Import GitHub repository
- Framework: Vite
- Build: `npm run build:prod`
- Output: `dist`

### Traditional Server

1. Run: `npm run build:prod`
2. Upload `dist/` folder
3. Configure server for SPA routing (see BUILD.md)

## Troubleshooting

### Build fails

```bash
npm run build:clean
npm ci
npm run build
```

### Tests fail

```bash
npm run test
```

### Linting errors

```bash
npm run lint:fix
npm run format
```

## Support

See detailed documentation:

- BUILD.md - Complete build guide
- DEPLOYMENT.md - Deployment details
- README.md - Project overview
