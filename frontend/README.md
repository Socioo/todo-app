# To-Do App with OAuth2/OIDC and RBAC

## Features
- Google OAuth2/OpenID Connect authentication
- Role-Based Access Control (User/Admin)
- JWT token-based API security
- PostgreSQL database with Prisma ORM
- React frontend with admin dashboard

## Setup Instructions
1. Install PostgreSQL, Node.js
2. Clone repository
3. Set up Google OAuth credentials
4. Update environment variables
5. Run migrations: `npx prisma migrate dev`
6. Start backend: `npm run dev`
7. Start frontend: `npm run dev`

## API Documentation
[Include your API endpoints here]

## RBAC Matrix
| Role  | View Own Todos | Edit Own Todos | View All Todos | Manage Users |
|-------|----------------|----------------|----------------|--------------|
| User  | ✓             | ✓             | ✗             | ✗           |
| Admin | ✓             | ✓             | ✓             | ✓           |