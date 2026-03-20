from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="DEVTrails AI Service", version="1.0.0")


class RiskRequest(BaseModel):
    rainProbability: float
    aqi: int
    areaRisk: float
    disruptionFrequency: float


class PremiumRequest(BaseModel):
    riskScore: float
    averageDailyEarnings: float


class FraudRequest(BaseModel):
    city: str
    zone: str
    triggerType: str
    duplicateClaims: int
    claimsInLastWeek: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict-risk")
def predict_risk(request: RiskRequest):
    rain_component = request.rainProbability * 0.35
    aqi_component = min(request.aqi / 500.0, 1.0) * 0.3
    area_component = request.areaRisk * 0.2
    disruption_component = request.disruptionFrequency * 0.15
    risk_score = min(1.0, rain_component + aqi_component + area_component + disruption_component)

    return {
        "riskScore": round(risk_score, 4),
        "rationale": (
            "Risk score blends rain probability, AQI stress, zone risk, "
            "and historical disruption frequency."
        ),
    }


@app.post("/calculate-premium")
def calculate_premium(request: PremiumRequest):
    base = 10
    earnings_factor = min(request.averageDailyEarnings / 1500.0, 1.0) * 20
    premium = base + (request.riskScore * 50) + earnings_factor
    premium = max(10, min(100, premium))

    return {
        "premium": round(premium, 2),
        "rationale": (
            "Weekly premium = base + (risk score multiplier) + capped earnings factor, "
            "constrained to the Rs. 10 to Rs. 100 band."
        ),
    }


@app.post("/detect-fraud")
def detect_fraud(request: FraudRequest):
    duplicate_component = min(request.duplicateClaims * 0.35, 0.7)
    frequency_component = min(request.claimsInLastWeek * 0.12, 0.36)
    location_component = 0.08 if request.zone.strip().lower() in {"unknown", "other"} else 0.0
    fraud_score = min(1.0, duplicate_component + frequency_component + location_component)

    return {
        "fraudScore": round(fraud_score, 4),
        "flagged": fraud_score >= 0.65,
        "reason": (
            "Fraud score increases for duplicate triggers, unusual weekly claim frequency, "
            "and suspicious location data."
        ),
    }
