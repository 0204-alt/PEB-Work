# API

Base path: `/api/v1`

All mutating engineering routes require `Authorization: Bearer <jwt>`.

## Health

`GET /api/v1/health`

Returns application version, disclaimer, and `engineeringCalculations: NOT_IMPLEMENTED` during Phase 1.

## Auth

`POST /api/v1/auth/register`

```json
{ "email": "user@example.com", "password": "at-least-10", "name": "Engineer" }
```

Passwords are bcrypt-hashed. This is not a frontend-only auth scheme.

`POST /api/v1/auth/login`

```json
{ "email": "user@example.com", "password": "at-least-10" }
```

## Projects

`POST /api/v1/projects`

Creates a canonical empty structural project (no generated members). Body:

```json
{
  "name": "Factory A",
  "location": "Neemrana",
  "buildingType": "Warehouse",
  "length_m": 175,
  "width_m": 120,
  "eaveHeight_m": 9.5,
  "client": "Optional"
}
```

The server assigns IDs and persists relational rows. The response is the canonical document. Frontend-calculated weights are not accepted.

`GET /api/v1/projects/:id`

Reconstructs the canonical document from PostgreSQL. Requires a project role.

## Not implemented

Geometry, loads, analysis, quantity, BOQ, estimate, STAAD generate/validate, reports.
