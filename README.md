# Workshop Registration Service - Frontend

Frontend application for the workshop registration system built with React, Vite, TypeScript, and Tailwind CSS.

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Environment configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Default config:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run development server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
```
Build output is saved to the `dist/` directory.

---

## Seeded Accounts (Dev Login)

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| Admin | kamal@gmail.com | AdminPass123! | Staff accounts and role management |
| Manager | nuwans@gmail.com | Password123! | Add/edit workshops, registrations, history |
| Staff | nimalp@gmail.com | Password123! | Workshop catalogue, registrations, history |

Quick-login shortcut buttons are also provided directly on the login page for testing.
