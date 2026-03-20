INSERT INTO users (name, phone, city, zone, delivery_type, average_daily_earnings, password, role, created_at)
VALUES ('Aarav Singh', '9999990001', 'Mumbai', 'Andheri', 'FOOD', 1200.00, 'demo123', 'USER', NOW());

INSERT INTO risk_data (city, zone, rain_probability, rainfall_mm, aqi, area_risk, disruption_frequency, curfew_active, platform_downtime, updated_at)
VALUES
    ('Mumbai', 'Andheri', 0.82, 72.0, 110, 0.74, 0.68, 0, 1, NOW()),
    ('Delhi', 'Saket', 0.31, 8.0, 312, 0.66, 0.55, 0, 0, NOW());
