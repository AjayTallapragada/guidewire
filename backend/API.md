# Backend API Reference

Base URL: `http://localhost:8000/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/users/{userId}`

## Policies

- `POST /policies/quote`
- `POST /policies/activate`
- `GET /policies/user/{userId}`

## Claims

- `GET /claims/user/{userId}`
- `POST /claims/{claimId}/payout`

## User Dashboard

- `GET /dashboard/user/{userId}`

## Admin

- `GET /admin/dashboard`
- `GET /admin/risk-data`
- `POST /admin/risk-data`
- `POST /admin/triggers/run`

## Example Requests

### Register Worker

```json
POST /api/auth/register
{
  "name": "Ravi",
  "phone": "9999911111",
  "city": "Delhi",
  "zone": "Saket",
  "deliveryType": "FOOD",
  "averageDailyEarnings": 1100,
  "password": "secret123"
}
```

### Get Policy Quote

```json
POST /api/policies/quote
{
  "userId": 1
}
```

### Activate Policy

```json
POST /api/policies/activate
{
  "userId": 1
}
```

### Run Trigger Engine

```json
POST /api/admin/triggers/run
```
