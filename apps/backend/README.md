# ASPA San Vicente - Backend API

Backend REST API for the ASPA San Vicente school management application.

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Testing**: Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
npm run prisma:migrate
npm run prisma:generate
```

4. (Optional) Seed the database:
```bash
npm run prisma:seed
```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed the database
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

Once the server is running, API documentation is available at:
- Swagger UI: `http://localhost:3000/api/docs`

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── middleware/      # Express middleware
│   ├── models/          # TypeScript types/interfaces
│   ├── utils/           # Utility functions
│   ├── validators/      # Zod validation schemas
│   ├── routes/          # Route definitions
│   ├── docs/            # API documentation
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── prisma/              # Prisma schema and migrations
└── dist/                # Build output
```

## License

MIT
