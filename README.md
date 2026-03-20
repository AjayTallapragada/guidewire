# DEVTrails 2026

AI-powered parametric insurance platform for India’s gig-economy delivery workers, focused strictly on loss of income caused by external disruptions.

## Problem Statement

Platform-based delivery workers such as Zomato, Swiggy, Zepto, Blinkit, Amazon, and other last-mile partners can lose working hours and daily income because of:

- heavy rain and flooding
- severe air pollution
- local curfews or zone shutdowns
- platform outages

This solution protects only lost income during those disruption windows. It does not cover health, life, accident, or vehicle repair claims.

## Chosen Persona

Primary persona:

- Food delivery partner operating in dense urban areas
- Works in a weekly earnings cycle
- Depends on uninterrupted access to roads, app availability, and safe outdoor conditions

Example worker:

- Name: Aarav Singh
- City: Mumbai
- Zone: Andheri
- Delivery type: Food
- Average daily earnings: Rs. 1,200

Why this persona:

- High exposure to weather and pollution
- Clear dependency on real-time mobility and platform availability
- Weekly income rhythm fits the challenge requirement directly

## Consumer Scenario

Example scenario for the chosen worker:

1. Aarav activates a weekly income protection plan.
2. The system monitors hyperlocal risk conditions in Andheri.
3. A heavy rainfall event and platform downtime reduce his delivery hours.
4. The platform detects the disruption automatically from the configured trigger rules.
5. A claim is created without Aarav filing anything manually.
6. Fraud checks run before payout release.
7. Approved lost-income compensation is pushed through the simulated payout rail.

## Scope Guardrails

- Covers only loss of income
- Premium is weekly only
- No health insurance
- No life insurance
- No accident insurance
- No vehicle repair or maintenance claims
- Claims are parametric and auto-generated

## Must-Have Features Coverage

### AI-Powered Risk Assessment

- Dynamic weekly premium calculation is implemented
- Predictive risk scoring uses rain probability, AQI, area risk, and disruption frequency
- Premium output is constrained to a worker-friendly weekly band

### Intelligent Fraud Detection

- Duplicate claim prevention
- Anomaly scoring on repeated trigger patterns
- Location validation logic tied to worker zone and risk feed
- Suspicious claim frequency monitoring

### Parametric Automation

- Trigger monitoring for weather, pollution, curfew, and platform downtime
- Automatic claim initiation with no manual form
- Instant payout simulation through mock payout rails

### Integration Capabilities

- Weather feed: mocked
- AQI feed: mocked
- Traffic / zone closure feed: mocked
- Platform API / outage feed: simulated
- Payment systems: mocked payout processing

## Product Workflow

### Worker Journey

1. Register or log in
2. Provide name, phone, city, zone, delivery type, and average daily earnings
3. Request a weekly quote
4. View AI-generated premium and weekly coverage amount
5. Activate weekly coverage
6. See auto-generated claims on the dashboard if disruption triggers fire
7. Track payout status

### Admin Journey

1. Review platform-wide claims and fraud alerts
2. Inspect risk feed inputs by city and zone
3. Run trigger evaluation
4. Review generated claims
5. Mark approved claims as paid
6. Track payout totals and weekly trends

## Weekly Premium Model

The platform is intentionally structured around a weekly policy model because gig workers earn and budget in short cycles.

### Inputs

- rain probability
- AQI
- area risk
- historical disruption frequency
- average daily earnings

### Risk Score

Risk score is normalized to `0.0` to `1.0`.

Current scoring logic:

- rain probability contributes 35%
- AQI contributes 30%
- area risk contributes 20%
- disruption frequency contributes 15%

### Premium Formula

Current weekly premium logic:

`premium = 10 + (risk_score * 50) + earnings_factor`

Where:

- `earnings_factor = min(average_daily_earnings / 1500, 1.0) * 20`
- output is capped to `Rs. 10` to `Rs. 100`

### Why Weekly Works Better Than Monthly

- easier for workers to understand
- aligns with real gig-worker payout cycles
- allows premium adaptation to changing local disruption risk
- reduces lock-in and supports short-horizon protection

## Parametric Triggers

The platform uses automatic claim initiation instead of manual claim filing.

### Trigger Set

- `HEAVY_RAIN`
  - fires when rainfall is greater than `50 mm`
- `HIGH_POLLUTION`
  - fires when AQI is greater than `250`
- `CURFEW`
  - fires when the zone closure flag is active
- `PLATFORM_DOWNTIME`
  - fires when the simulated partner platform outage flag is active

### Claim Logic

- affected hours are predefined by trigger type
- payout is based on daily earnings and affected work hours
- claims are inserted automatically into the worker history

## Payout Logic

The payout system is simulated but follows the intended production flow.

### Formula

`payout = hourly_income * affected_hours`

Where:

- `hourly_income = average_daily_earnings / 10`
- final payout is capped by weekly coverage amount

### Status Lifecycle

- `PENDING`
- `APPROVED`
- `PAID`

## AI / ML Integration Plan

### Phase 1

- establish worker persona
- define weekly premium strategy
- define trigger rules
- define fraud and payout workflow

### Phase 2

- dynamic premium scoring
- policy activation workflow
- trigger engine for automatic claims
- worker dashboard and admin controls

### Phase 3

- stronger anomaly detection
- more advanced location and activity validation
- richer risk analytics and predictive disruption trends
- more complete payout orchestration and alerting

## Tech Stack

### Frontend

- React
- Vite
- Plain CSS

### Backend

- FastAPI
- SQLite for reliable local execution

### AI / Scoring Logic

- Python-based scoring and fraud logic inside the FastAPI backend
- Separate `ai-service/` folder retained as a standalone AI microservice reference

### Why Web Instead of Mobile

- faster to demo for hackathon judging
- easier admin and worker flow validation in one app
- simpler deployment and testing for phase submissions
- enough flexibility to later wrap into a mobile-first experience if needed

## Development Plan

### Phase 1: Ideate & Know Your Delivery Worker

- define the delivery persona
- design weekly premium logic
- define trigger conditions
- document workflow and architecture

### Phase 2: Protect Your Worker

- implement registration and login
- implement quote and policy activation
- implement automated trigger evaluation
- implement auto-generated claims and payout simulation

### Phase 3: Perfect for Your Worker

- strengthen fraud logic
- expand dashboard insights
- improve visual risk views
- support real-time style updates and reminders

## Repository Structure

- `devtrails-app/`
  - React frontend
- `backend/`
  - FastAPI backend with local SQLite persistence
- `ai-service/`
  - standalone AI microservice reference
- `DEVTrails_2026_Usecase_Document.pdf`
  - original challenge brief

## Local Setup

### 1. Start the backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs on `http://localhost:8000`

### 2. Start the frontend

```bash
cd devtrails-app
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Deployment

This repo can now be deployed as a single Vercel project:

- React frontend built from `devtrails-app/`
- FastAPI backend exposed through `api/index.py`
- Vercel config at `vercel.json`

### Fastest Vercel deploy

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Keep the Root Directory as the repository root.
4. Vercel will read `vercel.json` and use:
   - `npm --prefix devtrails-app install`
   - `npm --prefix devtrails-app run build`
   - `devtrails-app/dist` as the frontend output
5. Click Deploy.

You do not need a separate backend host for the current demo flow.

### How it works on Vercel

- the frontend is served as a Vite static build
- all `/api/*` requests are rewritten to the FastAPI app in `api/index.py`
- in production, the frontend defaults to calling `/api`

### Important limitation

The backend uses SQLite. On Vercel, the database path now falls back to `/tmp/devtrails.db`, which is suitable for demos but not for durable production data.

That means:

- seeded demo data will work
- the app can create users, policies, and claims during a session
- data may reset between cold starts or fresh server instances

If you only need a hackathon/demo deployment quickly, this is fine. If you need persistent data later, move the database to Neon, Supabase, Turso, or another hosted database.

### Local development

- frontend still uses `http://localhost:8000/api` in dev mode
- production defaults to `/api`
- you can still override with `VITE_API_BASE_URL` if needed

## Demo Accounts

- Worker
  - Phone: `9999990001`
  - Password: `demo123`
- Admin
  - Phone: `9999999999`
  - Password: `admin123`

## API Summary

See [backend/API.md](d:/guidewire/backend/API.md) for the current API surface.

## Verification Completed

- frontend production build passes
- backend Python syntax check passes
- backend live API tested for:
  - login
  - quote generation
  - policy activation
  - trigger evaluation
  - payout simulation
  - user dashboard refresh
  - admin dashboard refresh

## What Is Relevant Beyond Phase 1

- the repository already contains a working prototype, not just an idea document
- the code is structured so the same repo can be extended for later DEVTrails phases
- the current design keeps the challenge constraints visible in both the product flow and documentation
