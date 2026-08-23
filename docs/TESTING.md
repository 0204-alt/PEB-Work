# Testing

## Phase 1

```powershell
npm run test:core
```

Covers:

- Canonical JSON round-trip
- Node/member/support/load combination persistence in the document
- Missing-node invariant
- Benchmark mass is not treated as engineering mass

API contract tests check that `createEmptyProject` remains serializable.

## Later phases

Unit: geometry, sections, loads, member checks, quantity, STAAD serializer  
Integration: calculation runs, Postgres, STAAD file generation  
E2E: create → calculate → validate → export  
Regression: V11.9 crane-off, span save; **do not** regress “grand total equals kg/m² × area”

## STAAD.Pro

If STAAD.Pro is not executed, tests must not claim execution validation.
