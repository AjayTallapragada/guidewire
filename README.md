# DEVTrails 2026 Full-Stack Platform

AI-powered parametric insurance platform for gig workers in India, focused only on loss of income caused by external disruptions.

## Scope Guardrails

- Covers only loss of income
- Weekly premium only
- No health, life, accident, or vehicle repair insurance
- Claims are auto-generated from parametric triggers

## Project Structure

- `devtrails-app/` - React frontend
- `backend/` - FastAPI backend with local SQLite persistence
- `ai-service/` - standalone AI microservice prototype kept for reference

## Core Features

- Registration and login for delivery workers
- User data capture: name, phone, city, zone, delivery type, average daily earnings
- Weekly policy quote and activation
- AI-based risk scoring and premium calculation
- Parametric trigger engine for:
  - Heavy rain
  - High pollution
  - Curfew / zone closure
  - Platform downtime
- Auto-generated claims and simulated payouts
- Fraud detection for duplicate claims, suspicious frequency, and location anomalies
- User dashboard and admin dashboard

## Weekly Pricing Model

The weekly premium is calculated by the AI service using:

- Rain probability
- AQI
- Area risk
- Historical disruption frequency
- Worker average daily earnings

Output is constrained to the `Rs. 10` to `Rs. 100` range.

## Parametric Trigger Logic

Claims are created automatically when active policies match disruption conditions:

- `HEAVY_RAIN`: rainfall greater than `50 mm`
- `HIGH_POLLUTION`: AQI greater than `250`
- `CURFEW`: mock zone closure feed becomes active
- `PLATFORM_DOWNTIME`: mock platform outage feed becomes active

No manual claim filing is required.

## AI Usage

The running backend uses Python scoring logic directly for:

- risk scoring
- dynamic weekly premium calculation
- fraud detection

This keeps the stack easy to run locally while preserving the same product behavior.

## Local Setup

### 1. Start the backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs on `http://localhost:8000`.

The backend creates `backend/devtrails.db` automatically with seeded demo data.

### 2. Start the frontend

```bash
cd devtrails-app
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Seeded Demo Accounts

- Worker:
  - Phone: `9999990001`
  - Password: `demo123`
- Admin:
  - Phone: `9999999999`
  - Password: `admin123`

## API Summary

See [backend/API.md](d:/guidewire/backend/API.md) for the main REST endpoints.

## Verification Completed

- Frontend: `npm.cmd run build`
- Backend: `python -m compileall main.py`
