from __future__ import annotations

import hashlib
import os
import sqlite3
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = "/tmp/devtrails.db" if os.getenv("VERCEL") else str(BASE_DIR / "devtrails.db")
DB_PATH = Path(os.getenv("DATABASE_PATH", DEFAULT_DB_PATH))

app = FastAPI(title="DEVTrails FastAPI Backend", version="1.0.0")
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterRequest(BaseModel):
    name: str
    phone: str
    city: str
    zone: str
    deliveryType: str
    averageDailyEarnings: float = Field(gt=0)
    password: str


class LoginRequest(BaseModel):
    phone: str
    password: str


class QuoteRequest(BaseModel):
    userId: int


class RiskDataRequest(BaseModel):
    city: str
    zone: str
    rainProbability: float
    rainfallMm: float
    aqi: int
    areaRisk: float
    disruptionFrequency: float
    curfewActive: bool
    platformDowntime: bool


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


@contextmanager
def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def init_db() -> None:
    with get_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL UNIQUE,
                city TEXT NOT NULL,
                zone TEXT NOT NULL,
                delivery_type TEXT NOT NULL,
                average_daily_earnings REAL NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS policies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                plan_name TEXT NOT NULL,
                weekly_premium REAL NOT NULL,
                weekly_coverage_amount REAL NOT NULL,
                risk_score REAL NOT NULL,
                active INTEGER NOT NULL,
                active_from TEXT NOT NULL,
                active_until TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS claims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                policy_id INTEGER NOT NULL,
                trigger_type TEXT NOT NULL,
                trigger_source TEXT NOT NULL,
                event_date TEXT NOT NULL,
                affected_hours INTEGER NOT NULL,
                payout_amount REAL NOT NULL,
                status TEXT NOT NULL,
                fraud_score REAL NOT NULL,
                flagged INTEGER NOT NULL,
                auto_generated INTEGER NOT NULL,
                event_key TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(policy_id) REFERENCES policies(id)
            );

            CREATE TABLE IF NOT EXISTS risk_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                zone TEXT NOT NULL,
                rain_probability REAL NOT NULL,
                rainfall_mm REAL NOT NULL,
                aqi INTEGER NOT NULL,
                area_risk REAL NOT NULL,
                disruption_frequency REAL NOT NULL,
                curfew_active INTEGER NOT NULL,
                platform_downtime INTEGER NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(city, zone)
            );
            """
        )

        now = datetime.now().isoformat()
        users = [
            ("Aarav Singh", "9999990001", "Mumbai", "Andheri", "FOOD", 1200, "demo123", "USER"),
            ("Admin User", "9999999999", "Bengaluru", "Indiranagar", "ECOMMERCE", 1500, "admin123", "ADMIN"),
        ]
        for user in users:
            db.execute(
                """
                INSERT OR IGNORE INTO users
                (name, phone, city, zone, delivery_type, average_daily_earnings, password_hash, role, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user[0],
                    user[1],
                    user[2],
                    user[3],
                    user[4],
                    user[5],
                    hash_password(user[6]),
                    user[7],
                    now,
                ),
            )

        risk_rows = [
            ("Mumbai", "Andheri", 0.82, 72, 110, 0.74, 0.68, 0, 1),
            ("Delhi", "Saket", 0.31, 8, 312, 0.66, 0.55, 0, 0),
            ("Bengaluru", "Indiranagar", 0.44, 18, 92, 0.35, 0.28, 0, 0),
            ("Hyderabad", "Madhapur", 0.39, 14, 130, 0.33, 0.24, 1, 0),
        ]
        for row in risk_rows:
            db.execute(
                """
                INSERT OR IGNORE INTO risk_data
                (city, zone, rain_probability, rainfall_mm, aqi, area_risk, disruption_frequency, curfew_active, platform_downtime, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (*row, now),
            )


@app.on_event("startup")
def startup_event() -> None:
    init_db()


def row_to_user(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "phone": row["phone"],
        "city": row["city"],
        "zone": row["zone"],
        "deliveryType": row["delivery_type"],
        "averageDailyEarnings": row["average_daily_earnings"],
        "role": row["role"],
    }


def get_user(user_id: int) -> sqlite3.Row:
    with get_db() as db:
        row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found")
    return row


def get_risk(city: str, zone: str) -> sqlite3.Row:
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM risk_data WHERE city = ? AND zone = ?",
            (city, zone),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Risk data not found")
    return row


def calculate_risk_score(risk: sqlite3.Row) -> float:
    return round(
        min(
            1.0,
            risk["rain_probability"] * 0.35
            + min(risk["aqi"] / 500.0, 1.0) * 0.3
            + risk["area_risk"] * 0.2
            + risk["disruption_frequency"] * 0.15,
        ),
        4,
    )


def calculate_premium(risk_score: float, earnings: float) -> float:
    earnings_factor = min(earnings / 1500.0, 1.0) * 20
    premium = 10 + (risk_score * 50) + earnings_factor
    return round(max(10, min(100, premium)), 2)


def calculate_fraud(duplicate_claims: int, claims_in_last_week: int, zone: str) -> tuple[float, bool]:
    location_component = 0.08 if zone.strip().lower() in {"unknown", "other"} else 0.0
    score = min(1.0, duplicate_claims * 0.35 + claims_in_last_week * 0.12 + location_component)
    return round(score, 4), score >= 0.65


def get_active_policy(user_id: int) -> sqlite3.Row | None:
    with get_db() as db:
        return db.execute(
            """
            SELECT * FROM policies
            WHERE user_id = ? AND active = 1
            ORDER BY id DESC
            LIMIT 1
            """,
            (user_id,),
        ).fetchone()


def policy_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {
        "id": row["id"],
        "planName": row["plan_name"],
        "weeklyPremium": row["weekly_premium"],
        "weeklyCoverageAmount": row["weekly_coverage_amount"],
        "riskScore": row["risk_score"],
        "active": bool(row["active"]),
        "activeFrom": row["active_from"],
        "activeUntil": row["active_until"],
    }


def claim_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "triggerType": row["trigger_type"],
        "triggerSource": row["trigger_source"],
        "eventDate": row["event_date"],
        "affectedHours": row["affected_hours"],
        "payoutAmount": row["payout_amount"],
        "status": row["status"],
        "fraudScore": row["fraud_score"],
        "flagged": bool(row["flagged"]),
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/register")
def register(request: RegisterRequest):
    with get_db() as db:
        existing = db.execute("SELECT id FROM users WHERE phone = ?", (request.phone,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Phone already registered")

        now = datetime.now().isoformat()
        cursor = db.execute(
            """
            INSERT INTO users
            (name, phone, city, zone, delivery_type, average_daily_earnings, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'USER', ?)
            """,
            (
                request.name,
                request.phone,
                request.city,
                request.zone,
                request.deliveryType,
                request.averageDailyEarnings,
                hash_password(request.password),
                now,
            ),
        )
        user = db.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return row_to_user(user)


@app.post("/api/auth/login")
def login(request: LoginRequest):
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE phone = ?", (request.phone,)).fetchone()
    if user is None or user["password_hash"] != hash_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return row_to_user(user)


@app.get("/api/auth/users/{user_id}")
def get_user_endpoint(user_id: int):
    return row_to_user(get_user(user_id))


@app.post("/api/policies/quote")
def quote_policy(request: QuoteRequest):
    user = get_user(request.userId)
    risk = get_risk(user["city"], user["zone"])
    risk_score = calculate_risk_score(risk)
    premium = calculate_premium(risk_score, user["average_daily_earnings"])
    coverage = round(user["average_daily_earnings"] * 6, 2)
    return {
        "riskScore": risk_score,
        "weeklyPremium": premium,
        "weeklyCoverageAmount": coverage,
        "rationale": "Weekly premium is based on weather, AQI, disruption frequency, and worker earnings.",
    }


@app.post("/api/policies/activate")
def activate_policy(request: QuoteRequest):
    user = get_user(request.userId)
    quote = quote_policy(request)
    today = date.today()
    until = today + timedelta(days=7)

    with get_db() as db:
        db.execute("UPDATE policies SET active = 0 WHERE user_id = ?", (request.userId,))
        cursor = db.execute(
            """
            INSERT INTO policies
            (user_id, plan_name, weekly_premium, weekly_coverage_amount, risk_score, active, active_from, active_until, created_at)
            VALUES (?, 'Weekly Income Shield', ?, ?, ?, 1, ?, ?, ?)
            """,
            (
                request.userId,
                quote["weeklyPremium"],
                quote["weeklyCoverageAmount"],
                quote["riskScore"],
                today.isoformat(),
                until.isoformat(),
                datetime.now().isoformat(),
            ),
        )
        policy = db.execute("SELECT * FROM policies WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return policy_to_dict(policy)


@app.get("/api/policies/user/{user_id}")
def get_policies(user_id: int):
    with get_db() as db:
        rows = db.execute("SELECT * FROM policies WHERE user_id = ? ORDER BY id DESC", (user_id,)).fetchall()
    return [policy_to_dict(row) for row in rows]


@app.get("/api/claims/user/{user_id}")
def get_claims(user_id: int):
    with get_db() as db:
        rows = db.execute("SELECT * FROM claims WHERE user_id = ? ORDER BY id DESC", (user_id,)).fetchall()
    return [claim_to_dict(row) for row in rows]


@app.post("/api/claims/{claim_id}/payout")
def payout_claim(claim_id: int):
    with get_db() as db:
        claim = db.execute("SELECT * FROM claims WHERE id = ?", (claim_id,)).fetchone()
        if claim is None:
            raise HTTPException(status_code=404, detail="Claim not found")
        db.execute("UPDATE claims SET status = 'PAID' WHERE id = ?", (claim_id,))
        updated = db.execute("SELECT * FROM claims WHERE id = ?", (claim_id,)).fetchone()
    return claim_to_dict(updated)


@app.get("/api/dashboard/user/{user_id}")
def user_dashboard(user_id: int):
    policy = get_active_policy(user_id)
    claims = get_claims(user_id)
    return {
        "activePolicy": policy_to_dict(policy),
        "weeklyPremium": policy["weekly_premium"] if policy else 0,
        "earningsProtected": policy["weekly_coverage_amount"] if policy else 0,
        "claims": claims,
    }


@app.get("/api/admin/risk-data")
def admin_risk_data():
    with get_db() as db:
        rows = db.execute("SELECT * FROM risk_data ORDER BY city, zone").fetchall()
    return [
        {
            "id": row["id"],
            "city": row["city"],
            "zone": row["zone"],
            "rainProbability": row["rain_probability"],
            "rainfallMm": row["rainfall_mm"],
            "aqi": row["aqi"],
            "areaRisk": row["area_risk"],
            "disruptionFrequency": row["disruption_frequency"],
            "curfewActive": bool(row["curfew_active"]),
            "platformDowntime": bool(row["platform_downtime"]),
        }
        for row in rows
    ]


@app.post("/api/admin/risk-data")
def upsert_risk_data(request: RiskDataRequest):
    with get_db() as db:
        now = datetime.now().isoformat()
        db.execute(
            """
            INSERT INTO risk_data
            (city, zone, rain_probability, rainfall_mm, aqi, area_risk, disruption_frequency, curfew_active, platform_downtime, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(city, zone) DO UPDATE SET
                rain_probability=excluded.rain_probability,
                rainfall_mm=excluded.rainfall_mm,
                aqi=excluded.aqi,
                area_risk=excluded.area_risk,
                disruption_frequency=excluded.disruption_frequency,
                curfew_active=excluded.curfew_active,
                platform_downtime=excluded.platform_downtime,
                updated_at=excluded.updated_at
            """,
            (
                request.city,
                request.zone,
                request.rainProbability,
                request.rainfallMm,
                request.aqi,
                request.areaRisk,
                request.disruptionFrequency,
                int(request.curfewActive),
                int(request.platformDowntime),
                now,
            ),
        )
        row = db.execute(
            "SELECT * FROM risk_data WHERE city = ? AND zone = ?",
            (request.city, request.zone),
        ).fetchone()
    return {
        "id": row["id"],
        "city": row["city"],
        "zone": row["zone"],
        "rainProbability": row["rain_probability"],
        "rainfallMm": row["rainfall_mm"],
        "aqi": row["aqi"],
        "areaRisk": row["area_risk"],
        "disruptionFrequency": row["disruption_frequency"],
        "curfewActive": bool(row["curfew_active"]),
        "platformDowntime": bool(row["platform_downtime"]),
    }


def maybe_create_claim(db: sqlite3.Connection, user: sqlite3.Row, policy: sqlite3.Row, trigger_type: str,
                       should_trigger: bool, affected_hours: int, source: str) -> dict[str, Any] | None:
    if not should_trigger:
        return None

    event_key = f"{policy['id']}-{trigger_type}-{date.today().isoformat()}"
    existing = db.execute("SELECT * FROM claims WHERE event_key = ?", (event_key,)).fetchone()
    if existing:
        return None

    duplicate_claims = db.execute(
        "SELECT COUNT(*) AS total FROM claims WHERE user_id = ? AND trigger_type = ?",
        (user["id"], trigger_type),
    ).fetchone()["total"]
    fraud_score, flagged = calculate_fraud(duplicate_claims, duplicate_claims, user["zone"])
    payout = round(min((user["average_daily_earnings"] / 10) * affected_hours, policy["weekly_coverage_amount"]), 2)
    status = "PENDING" if flagged else "APPROVED"
    cursor = db.execute(
        """
        INSERT INTO claims
        (user_id, policy_id, trigger_type, trigger_source, event_date, affected_hours, payout_amount, status, fraud_score, flagged, auto_generated, event_key, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        """,
        (
            user["id"],
            policy["id"],
            trigger_type,
            source,
            date.today().isoformat(),
            affected_hours,
            payout,
            status,
            fraud_score,
            int(flagged),
            event_key,
            datetime.now().isoformat(),
        ),
    )
    created = db.execute("SELECT * FROM claims WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return claim_to_dict(created)


@app.post("/api/admin/triggers/run")
def run_triggers():
    results: list[dict[str, Any]] = []
    with get_db() as db:
        policies = db.execute("SELECT * FROM policies WHERE active = 1").fetchall()
        for policy in policies:
            user = db.execute("SELECT * FROM users WHERE id = ?", (policy["user_id"],)).fetchone()
            risk = db.execute(
                "SELECT * FROM risk_data WHERE city = ? AND zone = ?",
                (user["city"], user["zone"]),
            ).fetchone()
            for claim in [
                maybe_create_claim(db, user, policy, "HEAVY_RAIN", risk["rainfall_mm"] > 50, 6, "OpenWeather mock rainfall threshold"),
                maybe_create_claim(db, user, policy, "HIGH_POLLUTION", risk["aqi"] > 250, 5, "AQI threshold exceeded"),
                maybe_create_claim(db, user, policy, "CURFEW", bool(risk["curfew_active"]), 8, "Mock curfew / zone closure feed"),
                maybe_create_claim(db, user, policy, "PLATFORM_DOWNTIME", bool(risk["platform_downtime"]), 4, "Mock platform outage feed"),
            ]:
                if claim:
                    results.append(claim)
    return results


@app.get("/api/admin/dashboard")
def admin_dashboard():
    with get_db() as db:
        total_claims = db.execute("SELECT COUNT(*) AS total FROM claims").fetchone()["total"]
        fraud_alerts = db.execute("SELECT COUNT(*) AS total FROM claims WHERE flagged = 1").fetchone()["total"]
        active_policies = db.execute("SELECT COUNT(*) AS total FROM policies WHERE active = 1").fetchone()["total"]
        total_payouts = db.execute("SELECT COALESCE(SUM(payout_amount), 0) AS total FROM claims WHERE status = 'PAID'").fetchone()["total"]
    return {
        "totalClaims": total_claims,
        "fraudAlerts": fraud_alerts,
        "totalPayouts": total_payouts,
        "activePolicies": active_policies,
        "weeklyTrends": [
            "Heavy rain claims increasing in Mumbai zones",
            "AQI risk remains elevated in Delhi belts",
            "Platform downtime events create short payout bursts",
        ],
    }
