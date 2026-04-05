# SolidVis CRM Platform

> **Next-Gen B2B Enterprise CRM** — Real-time cloud data, voice-controlled AI search, and enterprise order management for 500,000+ records. Deployed on Vercel.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-solidvis--crm--platform.vercel.app-00d2ff?style=for-the-badge&logo=vercel)](https://solidvis-crm-platform.vercel.app)
[![Built With](https://img.shields.io/badge/Built%20With-React%20%2B%20Vite%20%2B%20Supabase-9b59b6?style=for-the-badge)](https://vitejs.dev/)

---

## Screenshots

> Login with Supabase Auth → Access the secure dashboard → Manage orders, companies, and invoices in real time.

---

## Features

- **🔐 Secure Authentication** — Supabase native auth with login/register gateway
- **📊 Live Dashboard** — Animated KPI counters, live payment status pie chart, order trajectory line chart
- **🏢 CRM / Companies** — Search and browse all registered client companies from cloud database
- **📦 Orders & Products** — Create orders with full product bifurcation, auto-linked pricing, and real-time total bill calculation
- **🧾 Invoices & Payments** — Browse 2M+ invoice records with debounced search, optimized for zero timeout
- **🎙️ Voice Assistant** — AI-powered voice navigation and search across all tabs (say *"Search for order 157849"* or *"Find client TCS"*)
- **🖱️ Reactive Mouse Aura** — Premium interactive background that tracks cursor movement
- **✨ Glassmorphism UI** — Premium dark-mode design with Framer Motion animations and micro-interactions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| UI Library | Ant Design, Framer Motion, Lucide Icons |
| Charts | Recharts |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Native Auth |
| Hosting | Vercel |
| Styling | Vanilla CSS (Glassmorphism) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with the schema applied

### 1. Clone the repository
```bash
git clone https://github.com/SOUMILCHANDRA/Solidvis-CRM-Platform.git
cd Solidvis-CRM-Platform/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file inside the `frontend/` folder:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run locally
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Database Schema

Run the SQL files in the root of this repository against your Supabase project in this order:

1. `crm_schema_setup.sql` — Creates all tables (COMPANY, ORDERS, PRODUCT, INVOICE, PAYMENT, etc.)
2. `supabase_schema.sql` — Additional schema configurations
3. `supabase_inserts.sql` — Seed data inserts
4. `supabase_massive_data.sql` — Large-scale data generation

---

## Deployment

This project is deployed on **Vercel**. To deploy your own instance:

```bash
cd frontend
npx vercel
```

Make sure to add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your Vercel project's **Environment Variables** settings before the final production build.

---

## Voice Assistant Commands

| Say | Action |
|---|---|
| *"Dashboard"* | Navigate to Dashboard |
| *"Orders"* | Navigate to Orders tab |
| *"Companies"* | Navigate to Companies tab |
| *"Invoices"* | Navigate to Invoices tab |
| *"Search for [term]"* | Auto-search in current tab |
| *"Find order [ID]"* | Navigate to Orders and search |
| *"Find client [name]"* | Navigate to Companies and search |
| *"Search invoice [ID]"* | Navigate to Invoices and search |
| *"Add order"* | Navigate to Orders and open New Order modal |

---

## Project Structure

```
Solidvis-CRM-Platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthView.tsx        # Login / Register screen
│   │   │   ├── DashboardView.tsx   # KPI charts & stats
│   │   │   ├── CompaniesView.tsx   # Client company browser
│   │   │   ├── OrdersView.tsx      # Orders + product bifurcation
│   │   │   └── InvoicesView.tsx    # Invoice & payment tracker
│   │   ├── lib/
│   │   │   └── supabase.ts         # Supabase client init
│   │   ├── App.tsx                 # Root app + voice assistant
│   │   └── index.css               # Glassmorphism design system
│   └── index.html
├── crm_schema_setup.sql
├── supabase_schema.sql
├── supabase_inserts.sql
└── supabase_massive_data.sql
```

---

## License

This project is proprietary software developed for internal enterprise use by **SolidVis**.

---

*Built with ❤️ using React, Supabase, and Vercel.*
