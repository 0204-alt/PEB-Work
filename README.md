# PEB Platform

Preliminary PEB design, structural modelling, quantity, BOQ, estimate, and STAAD.Pro `.STD` generation.

**PRELIMINARY DESIGN / ESTIMATION — FINAL STRUCTURAL DESIGN TO BE VERIFIED BY QUALIFIED ENGINEER.**

This is not a certified issue-for-construction system.

## Current status

**Phase 1 (domain model)** is in progress in this repository.

- Canonical TypeScript project document with serialize/deserialize tests
- PostgreSQL / Prisma schema for the engineering graph
- Password hashing + JWT authentication (API)
- V11.9 browser prototype frozen under `legacy/v11.9/`
- Authoritative quantity engine is **not** implemented (and V11.9 benchmark scaling is **not** ported)

See `docs/IMPLEMENTATION_PLAN.md` and `docs/phases.md`.

## Repository layout

```
apps/web                 Vite + React shell (no engineering dashboard)
apps/api                 Express /api/v1
packages/engineering-core
packages/database
packages/shared
prisma/
legacy/v11.9/
docs/
```

## Quick start

See `docs/SETUP.md`.
