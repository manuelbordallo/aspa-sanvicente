# Prisma Database Setup

This directory contains the Prisma schema and migrations for the ASPA San Vicente backend API.

## Database Schema

The schema includes the following models:

- **User**: User accounts with authentication and role management
- **News**: News articles created by admin users
- **Notice**: Personal notices sent between users
- **CalendarEvent**: School calendar events
- **UserGroup**: Groups of users for bulk notice sending
- **UserGroupMember**: Many-to-many relationship between users and groups
- **PasswordResetToken**: Tokens for password reset functionality

## Setup Instructions

### 1. Configure Database Connection

Update the `DATABASE_URL` in your `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aspa_db
```

### 2. Run Migrations

To apply the database schema to your PostgreSQL database:

```bash
npm run prisma:migrate
```

This will create all tables, indexes, and relationships defined in the schema.

### 3. Generate Prisma Client

The Prisma Client is automatically generated when you install dependencies. To regenerate it manually:

```bash
npm run prisma:generate
```

### 4. Seed the Database (Optional)

To populate the database with initial data:

```bash
npm run prisma:seed
```

## Available Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with initial data

## Schema Updates

When you modify the `schema.prisma` file:

1. Create a new migration:
   ```bash
   npx prisma migrate dev --name description_of_changes
   ```

2. The Prisma Client will be automatically regenerated

## Using Prisma Client

Import and use the Prisma Client in your code:

```typescript
import prisma from './config/database';

// Example: Find all users
const users = await prisma.user.findMany();

// Example: Create a news article
const news = await prisma.news.create({
  data: {
    title: 'New Article',
    content: 'Article content...',
    summary: 'Brief summary',
    authorId: userId,
  },
});
```

## Database Indexes

The schema includes optimized indexes for:

- User email lookups (unique index)
- News and events by creation date
- Notices by recipient and read status
- Calendar events by date
- Password reset tokens by token value

## Relationships

- **User → News**: One-to-many (author)
- **User → Notice**: One-to-many (author and recipient)
- **User → CalendarEvent**: One-to-many (author)
- **User ↔ UserGroup**: Many-to-many (through UserGroupMember)
- **User → PasswordResetToken**: One-to-many

## Notes

- All IDs use UUID format for security and scalability
- Timestamps are automatically managed by Prisma
- Cascade deletes are configured for group memberships and password reset tokens
- The Role enum supports USER and ADMIN values
