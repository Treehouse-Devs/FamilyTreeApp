# Family Schema and Log Redaction Fix

## Context

The manually deployed staging API passed its health, authentication, profile,
and upload checks, then returned `500` from `POST /trees`. The correlated
PostgreSQL error was:

```text
column "rootId" of relation "families" does not exist
```

The `Family` entity declares both `rootId` and `familyImageUrl`, but the
committed migrations create neither column. Production correctly runs with
TypeORM schema synchronization disabled, so entity changes must be represented
by migrations.

The same failure event also included the request authorization header. Failure
events are useful for staging diagnosis, but credentials must not be written to
Docker logs or Loki.

## Scope

This fix will:

- add the two missing nullable `families` columns through one reversible
  TypeORM migration;
- preserve all existing family rows without backfilling synthetic values;
- redact sensitive request and response headers in structured failure events;
- add regression coverage at the migration and failure-event seams;
- manually deploy the resulting immutable backend image;
- apply the migration before replacing the healthy backend;
- rerun the complete 25-test staging API suite with guaranteed disposable-user
  cleanup.

It will not change family root-selection behavior, introduce a `rootId` foreign
key, alter existing family data, enable TypeORM schema synchronization, or
redact ordinary non-sensitive diagnostic fields.

## Database Design

A new migration will add:

```sql
ALTER TABLE "families"
  ADD "rootId" uuid,
  ADD "familyImageUrl" character varying;
```

Both columns remain nullable, matching the current entity. Existing families
therefore remain valid. `rootId` will not receive a foreign key because the
entity does not model one and the current service falls back to the first
parentless member when `rootId` is null.

The migration `down` method will drop `familyImageUrl` first and `rootId`
second. The migration will use the repository's existing `MigrationInterface`
and `QueryRunner.query` conventions and will run under TypeORM's normal
transaction behavior.

## Log Redaction Design

Before constructing a failure event, request and response headers will be
copied through a focused redaction function. Header names will be matched
case-insensitively. At minimum, these credential-bearing headers will be
replaced with `[REDACTED]`:

- `authorization`
- `cookie`
- `set-cookie`
- `proxy-authorization`

Non-sensitive headers such as `content-type`, `user-agent`, and
`x-request-id` will remain available for diagnosis. The implementation will not
mutate the original Express request or response header objects.

## Regression Seams

The migration's public `up` and `down` methods are the schema regression seam.
A focused test will assert that applying the migration emits the additive
nullable-column SQL and reverting it emits the matching drop operations.
Release verification will also compile migrations and execute them against
PostgreSQL.

The structured failure event is the redaction seam. The existing NestJS
integration test will send credential-bearing and ordinary headers, then assert
that the captured event redacts credentials while retaining diagnostic
headers.

The final public acceptance seam is the deployed API. The Playwright staging
suite must report all 25 tests passed, including `POST /trees`, tree/member
ownership, uploads, refresh-token rotation, password reset, and account
deletion.

## Deployment and Rollback

The backend will be rebuilt as `familytree/backend:<commit-sha>`, saved as a
checksummed archive, and deployed using the repository's guarded deployment
script. The script will:

1. validate and load the immutable image;
2. keep the current backend running while the migration executes;
3. replace the backend only after migration success;
4. wait for backend health;
5. roll the application image back if readiness fails;
6. keep Grafana at its 512 MB hard memory limit.

The migration is additive and nullable, so the previous application image
remains compatible with the upgraded database. If an explicit database rollback
is later required, the migration `down` method is available, but it must only be
run after confirming no stored values need preservation.

## Success Criteria

- Lint, typecheck, build, and backend tests pass.
- The new migration compiles and applies successfully.
- The staging `families` table contains nullable `rootId` and
  `familyImageUrl` columns.
- Failure events contain `[REDACTED]` instead of credential header values.
- Backend, PostgreSQL, Grafana, Loki, and Alloy remain healthy.
- Grafana's hard memory limit remains 512 MB.
- The staging API E2E report shows 25 passed, zero failed, and zero skipped.
- Disposable Firebase users and test data are cleaned after the run.
