# StreakForge

A mobile-first, production-ready daily habits, routines, nutrition, and performance planner. Built to maintain discipline, track training, nutrition, hydration, and sleep with multi-profile and cloud database synchronization.

## 🚀 Features
- **Modern Sports & Productivity UI:** Mobile-first design using Tailwind CSS and shadcn/ui.
- **Progressive Web App (PWA):** Installable on mobile and desktop devices for offline use.
- **Daily Planner & Tracker:** Track custom routines, nutrition, drills, hydration, and sleep.
- **Performance Stats & Badges:** Visualize completion trends, monthly rates, best streaks, and achievement badges.
- **Dynamic Templates & Library:** Reusable routine snippets, meal plans, and target drills.
- **Cloud & Local Sync:** Full-stack Spring Boot + Neon PostgreSQL synchronization with offline resilience.

## 🛠 Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend:** Java 21, Spring Boot 4, Spring Security, Spring Data JPA
- **Database:** PostgreSQL (Neon Cloud Serverless DB) / Local Docker PostgreSQL
- **Migrations:** Flyway

## 📦 Project Structure

```
streakforge/
├── frontend/               ── React 18 + Vite Web App
├── backend/                ── Java 21 Spring Boot REST API
├── docker-compose.yml      ── PostgreSQL Database Container
├── scripts/                ── Seed & Utility Scripts
└── README.md
```

## 🚀 Getting Started

### 1. Start Backend API
```bash
cd backend
set -a && source .env && set +a   # Loads database credentials
mvn spring-boot:run
```
The API server starts at `http://localhost:8080`.
Check health: `http://localhost:8080/actuator/health`

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
The web app starts at `http://localhost:5173/streakforge/`.

### 3. Seed Sample Data (Optional)
```bash
node scripts/seed.js user@example.com MyPassword123
```

## 🔒 Storage & Database
The application stores records in Neon PostgreSQL cloud database with active profile IDs managed via `sf-active-profile-id`. Each date is an independent entry, ensuring changes to one day never affect historical records.

## 🌐 Production Deployment

### 1. Deploy Backend on Render (Free Tier)
1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com) and click **New + $\rightarrow$ Web Service**.
3. Select your `streakforge` GitHub repository.
4. Configure service settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Docker Command / File:** `Dockerfile`
   - **Region:** Choose closest to your users (e.g. `Singapore` or `Frankfurt`)
   - **Plan:** `Free`
5. Under **Environment Variables**, configure:
   - `DATABASE_URL`: `jdbc:postgresql://<neon-host>/neondb?sslmode=require`
   - `DATABASE_USERNAME`: `<your neon username>`
   - `DATABASE_PASSWORD`: `<your neon password>`
   - `JWT_SECRET`: `<secure-random-32-char-secret>`
   - `ALLOWED_ORIGINS`: `https://<your-username>.github.io,https://*.onrender.com,https://*.vercel.app`
6. Click **Deploy Web Service**. Your backend endpoint will be `https://streakforge-api.onrender.com`.

### 2. Deploy Frontend on GitHub Pages / Vercel
1. Set the production environment variable `VITE_API_URL` to your Render API URL (e.g. `https://streakforge-api.onrender.com`).
2. Build and publish:
   ```bash
   cd frontend
   npm run build
   ```
3. Deploy the `dist/` directory to GitHub Pages, Cloudflare Pages, or Vercel.

