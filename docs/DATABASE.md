# Database

PostgreSQL is the system of record. Projects are not stored as a single JSON blob.

Prisma schema: `prisma/schema.prisma`

## Phase 1 tables

Identity: `User`, `ProjectUser` (roles: ADMIN, DESIGN_ENGINEER, ESTIMATOR, REVIEWER, VIEWER)

Project graph: `Project`, `DesignBasis`, `ProjectGeometry`, `GridLine`, `Bay`, `Span`, `Node`, `Member`, `MemberGroup`, `Support`, `Release`, `LoadCase`, `LoadApplication`, `LoadCombination`, `CombinationFactor`, `Material`, `Section`, `ValidationResult`, `ValidationIssue`, `DesignRun`, `AuditLog`

Catalog: `Standard`, `StandardVersion`, `MaterialGrade`, `SectionFamily`

## JSONB usage

- `DesignBasis.payload` — versioned nested design-basis document for the project
- `Project.benchmark` — comparison fields only
- `DesignRun.snapshot` / warnings / errors — calculation run snapshots (unused until an orchestrator exists)
- `Node.metadata` — optional semi-structured tags

The member/node graph is relational with foreign keys. Deleting a project cascades engineering rows.

## Identifiers

UUID primary keys. Unique `(projectId, label)` on nodes and members.

## Migrations

Use Prisma migrations only. Do not edit production databases by hand.
