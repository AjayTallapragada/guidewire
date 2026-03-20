INSERT INTO users (id, name, phone, city, zone, delivery_type, average_daily_earnings, password, role, created_at)
VALUES
    (1, 'Aarav Singh', '9999990001', 'Mumbai', 'Andheri', 'FOOD', 1200.00, 'demo123', 'USER', NOW()),
    (2, 'Admin User', '9999999999', 'Bengaluru', 'Indiranagar', 'ECOMMERCE', 1500.00, 'admin123', 'ADMIN', NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO risk_data (id, city, zone, rain_probability, rainfall_mm, aqi, area_risk, disruption_frequency, curfew_active, platform_downtime, updated_at)
VALUES
    (1, 'Mumbai', 'Andheri', 0.82, 72.0, 110, 0.74, 0.68, false, true, NOW()),
    (2, 'Delhi', 'Saket', 0.31, 8.0, 312, 0.66, 0.55, false, false, NOW()),
    (3, 'Bengaluru', 'Indiranagar', 0.44, 18.0, 92, 0.35, 0.28, false, false, NOW()),
    (4, 'Hyderabad', 'Madhapur', 0.39, 14.0, 130, 0.33, 0.24, true, false, NOW())
ON DUPLICATE KEY UPDATE city = VALUES(city);
