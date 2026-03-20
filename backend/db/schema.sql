CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    city VARCHAR(80) NOT NULL,
    zone VARCHAR(80) NOT NULL,
    delivery_type VARCHAR(30) NOT NULL,
    average_daily_earnings DECIMAL(10,2) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE policies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    plan_name VARCHAR(120) NOT NULL,
    weekly_premium DECIMAL(10,2) NOT NULL,
    weekly_coverage_amount DECIMAL(10,2) NOT NULL,
    risk_score DOUBLE NOT NULL,
    active BIT NOT NULL,
    delivery_type VARCHAR(30) NOT NULL,
    active_from DATE NOT NULL,
    active_until DATE NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_policies_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE claims (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    policy_id BIGINT NOT NULL,
    trigger_type VARCHAR(40) NOT NULL,
    trigger_source VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    affected_hours INT NOT NULL,
    payout_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    fraud_score DOUBLE,
    flagged BIT NOT NULL,
    auto_generated BIT NOT NULL,
    event_key VARCHAR(120) UNIQUE,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_claims_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_claims_policy FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE TABLE risk_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(80) NOT NULL,
    zone VARCHAR(80) NOT NULL,
    rain_probability DOUBLE,
    rainfall_mm DOUBLE,
    aqi INT,
    area_risk DOUBLE,
    disruption_frequency DOUBLE,
    curfew_active BIT NOT NULL,
    platform_downtime BIT NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uq_city_zone (city, zone)
);
