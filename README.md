# Store Rating Portal - Full-Stack Web Application

A full-stack Store Rating Portal built for the FullStack Intern Coding Challenge featuring role-based access control for **System Administrators**, **Store Owners**, and **Normal Users (Customers)**.

---

## 🏗️ Architecture & Tech Stack

- **Monorepo Layout**: Clean separation into `/backend` and `/client` orchestrated via npm workspaces.
- **Backend**: Express.js REST API service with Prisma ORM connecting to MySQL (`store_rating_db`).
- **Frontend**: Standard React.js (JavaScript/JSX with Vite), clean custom CSS, responsive layout.
- **Authentication & Security**: Salted Bcrypt password hashing, JWT authentication with Bearer tokens, and role-based middleware guards (RBAC).
- **Validation**: Strict schema constraints (Name 20–60 chars, Password 8–16 chars with uppercase & special character, Email, Address max 400 chars, Rating 1–5 stars).

---

## 📁 Repository Structure

```text
Final Project/
├── backend/                       # Express.js + Prisma + MySQL API
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, Store, Rating)
│   │   └── seed.ts                # Seeder script with demo accounts & stores
│   ├── src/
│   │   ├── config/db.ts           # PrismaClient MySQL connection singleton
│   │   ├── controllers/           # Auth, Admin, User, Store Owner controllers
│   │   ├── middlewares/           # JWT auth, Role guards, Zod validation, Error handler
│   │   ├── routes/                # Express modular routers (/api/auth, /api/admin, /api/user, /api/owner)
│   │   ├── validations/schemas.ts # Zod validation schemas
│   │   ├── types/index.ts         # TypeScript interfaces
│   │   └── index.ts               # Express bootstrap & startup
│   ├── .env                       # Environment configuration
│   └── package.json
├── client/                        # React.js SPA (Vite + Clean Custom CSS)
│   ├── src/
│   │   ├── components/            # Navbar, ProtectedRoute, StarRating
│   │   ├── context/AuthContext.jsx# Global session management & token persistence
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Unified login with demo credentials quick-fill
│   │   │   ├── RegisterPage.jsx   # Customer registration with live validation
│   │   │   ├── ChangePasswordPage.jsx # Password update with policy checklist
│   │   │   ├── admin/             # AdminDashboard, AdminUsers, AdminStores
│   │   │   ├── user/              # UserStores (browsing & interactive rating)
│   │   │   └── owner/             # OwnerDashboard (store stats & customer reviews)
│   │   ├── services/api.js        # Axios instance with Bearer interceptors
│   │   ├── App.jsx                # Route definitions & guards
│   │   ├── index.css              # Custom modern stylesheet
│   │   └── main.jsx
│   ├── vite.config.js             # Vite proxy (/api -> http://localhost:5000)
│   └── package.json
└── package.json                   # Root monorepo orchestrator
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v26)
- **MySQL Server** running with user `root` and password `root` (default configured port `3307`, or update `.env` to `3306`).

### 2. Database Migration & Seeding
From the root directory:
```bash
# Generate Prisma client
npm run db:generate --workspace=backend

# Run migrations (or push schema)
npm run db:push --workspace=backend

# Seed database with initial Admin, Store Owners, Normal Users, and demo stores
npm run backend:seed
```

### 3. Launch Development Servers
Run both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Or run individually:
```bash
# In Terminal 1 (Backend API)
npm run backend:dev

# In Terminal 2 (React Frontend)
npm run client:dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `AdminPass123!` | View aggregate stats, manage all users (search/filter/sort), add new users, manage stores, assign owners. |
| **Store Owner** | `owner.sarah@storerating.com` | `OwnerPass123!` | View assigned store ("Downtown Tech Emporium"), overall average rating, and table of customer ratings. |
| **Store Owner (2)** | `owner.david@storerating.com` | `OwnerPass123!` | View assigned store ("Green Harvest Organic Mart"), overall average rating, and reviews. |
| **Normal User** | `user.john@storerating.com` | `UserPass123!` | Browse stores, search by name/address, sort by rating/name/address, submit and modify 1–5 star ratings. |
| **Normal User (2)** | `user.emily@storerating.com` | `UserPass123!` | Browse stores and rate stores. |

*(Note: The login page also features one-click demo credential autofill buttons for fast testing).*

---

## 📋 Challenge Validation Rules

- **Name**: 20 to 60 characters.
- **Address**: Up to 400 characters.
- **Password**: 8 to 16 characters, containing at least 1 uppercase letter and at least 1 special character.
- **Rating**: Integer between 1 and 5 stars.
- **Single Rating Constraint**: A user can submit only one rating per store; re-submitting updates the existing rating.
