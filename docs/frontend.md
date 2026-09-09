# HoneyChain Frontend Documentation

## Overview
The HoneyChain frontend is a modern, high-performance React web application built with TypeScript, Vite, React Router v6, Axios, Recharts, and Lucide React icons. It provides a rich dashboard and supply chain management workspace for BEEKEEPER, QUALITY_INSPECTOR, and ADMIN roles, alongside a public consumer verification portal.

## Architecture

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/          # ProtectedRoute component
│   │   ├── common/        # PageHeader, MetricCard, StatusBadge, LoadingState, etc.
│   │   └── layout/        # MainLayout, Sidebar, TopBar
│   ├── context/           # AuthContext & useAuth hook
│   ├── pages/             # 14 page components (Dashboard, Hives, Batches, Quality, etc.)
│   ├── services/          # apiClient (Axios) & api (backend API integration)
│   ├── types/             # TypeScript DTO interfaces & domain models
│   ├── App.tsx            # Main router & provider wrapper
│   ├── main.tsx           # Application root entry
│   └── index.css          # Core CSS design system (Honey-glow dark theme)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Core Features & Role Access

| Module | Route | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **Login** | `/login` | Public | Interactive login with demo credentials for Quick Role Switch |
| **Dashboard** | `/dashboard` | Authenticated | Executive summary metrics, active alerts, batch status charts |
| **Apiary & Hives** | `/hives`, `/hives/:hiveId` | Authenticated | Hive list & detail with Recharts telemetry history (Temp, Humidity, Weight, Acoustic Hz) & AI health score |
| **AI Alerts** | `/alerts` | Authenticated | Real-time AI anomaly alerts with risk scores & mitigation recommendations |
| **Honey Batches** | `/batches`, `/batches/:batchId` | Authenticated | Batch lifecycle tracking with visual progress timeline & emergency recall action |
| **Quality Control** | `/quality` | QUALITY_INSPECTOR, ADMIN | Lab inspection entry (Moisture %, pH, Color score) & Pass/Fail verification |
| **Processing** | `/processing` | Authenticated | Honey processing logs (Extraction, Pasteurization, Filtration, Packaging) |
| **Packages** | `/packages` | Authenticated | Retail packaging & QR code identifier generator |
| **Traceability** | `/traceability` | Authenticated | Cryptographic supply chain audit timeline & hash validation |
| **Apiary Farms** | `/farms` | Authenticated | Farm registration & geographical management |
| **User Management** | `/users` | ADMIN | Role allocation & user account enable/disable toggle |
| **Public Verification** | `/verify`, `/verify/:packageId` | Public | Public QR verification portal for end consumers |

## Configuration
Environment configuration is defined in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
