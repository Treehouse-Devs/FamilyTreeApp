# Backend Log Monitor Design

**Status:** Approved for implementation planning  
**Date:** 2026-07-16  
**Initial environment:** Staging only

## Context

The frontend team needs a browser-accessible view of failed backend requests so they can diagnose API integration problems without direct VPS or container access. The NestJS backend currently logs request metadata to stdout after every response, but it does not capture request bodies, response bodies, exception details, or searchable structured fields.

The backend runs with PostgreSQL on one Docker Compose VPS. The host has about 15 GB of free disk, and Caddy already terminates HTTPS for `api-treely.arkaes.dev`.

## Goals

- Capture every backend `4xx` and `5xx` response as structured diagnostic data.
- Include request and response details needed to reproduce frontend failures.
- Provide a protected Grafana dashboard at `https://api-treely.arkaes.dev/log/`.
- Refresh dashboard results every five seconds.
- Retain staging failures for 48 hours while keeping storage bounded.
- Keep API behavior independent from the availability of the monitoring stack.
- Make production enablement explicit rather than automatic.

## Non-Goals

- Capturing successful `2xx` or redirect `3xx` traffic.
- Long-term audit, analytics, metrics, tracing, or alert management.
- Storing binary upload contents.
- Managing multiple dashboard users or roles in the first release.
- Enabling unredacted capture in production.
- Providing high availability for Grafana or Loki.

## Constraints And Decisions

- Expected volume is below 1,000 failed requests per day.
- Request and response JSON/text bodies may each contain up to 256 KiB in a captured event.
- Uploaded files are represented by metadata only: field name, original filename, MIME type, and byte size.
- Values are intentionally not redacted in the first staging release. Passwords, authorization headers, cookies, tokens, reset codes, and personal data can therefore appear in logs.
- The feature is disabled by default and enabled only when `LOG_MONITOR_ENABLED=true`.
- Loki accepts structured event lines up to 1 MiB so one event can contain two capped bodies plus metadata. The application remains responsible for the tighter 256 KiB per-body limits.
- Loki local filesystem storage is not encrypted by the application. It inherits the VPS filesystem encryption and access controls. Production must not be enabled until redaction and the host's at-rest encryption requirements are reviewed.

## Architecture

```text
Frontend client
    |
    v
NestJS request/response capture middleware + exception metadata filter
    |
    | one JSON line per 4xx/5xx
    v
Backend stdout -> Docker json-file logs
                      |
                      v
                    Alloy -> Loki filesystem volume
                                |
                                v
Caddy basic auth -> Grafana provisioned dashboard
https://api-treely.arkaes.dev/log/
```

The backend writes failure events only to stdout. Alloy tails Docker JSON log files from a read-only filesystem mount, parses the nested event JSON, selects `event="http_failure"`, and forwards matching records to Loki. This avoids granting Alloy access to the Docker control socket.

Loki, Alloy, and Grafana share a private Compose network. Loki and Alloy publish no host ports. Grafana publishes its port only on VPS loopback, and Caddy is the only public entry point.

## Backend Capture

### Request And Response Context

A global middleware assigns or validates a request ID, records the request start time, and returns the request ID in the response. A client-provided request ID is accepted only when it matches a bounded safe format; otherwise the backend generates a UUID.

The same middleware observes Express response writes without changing their return values or callback behavior. It retains at most 256 KiB of response bytes and, on the response `finish` event, emits one failure event when the final status is `4xx` or `5xx`. Waiting until `finish` provides the final status and backend response headers and covers guard, pipe, route-interceptor, controller, service, and manually written Express responses.

### Failure Paths

Two lifecycle components cover all failure paths without changing controller contracts:

- The global middleware captures the final request/response record and emits it exactly once.
- A dependency-injected global exception filter attaches exception metadata to the request context, then delegates response handling to Nest's base exception filter so existing HTTP behavior is preserved.

The components share one request context, serializer, and event writer. Only the response `finish` handler emits events, preventing duplicates.

### Event Schema

Each event contains:

- `event`, `schemaVersion`, `timestamp`, `environment`, and `service`
- `requestId`, elapsed duration, HTTP method, original path, route parameters, and query parameters
- Request IP, user agent, headers, and authenticated user identifier when available
- Serialized request body and uploaded-file metadata
- Response status, backend response headers, and serialized response body
- Exception name, message, and stack when an exception exists
- Capture metadata including original byte counts, truncation flags, and serialization errors

Only bounded, low-cardinality values become Loki labels: service, environment, HTTP method, and status class. Paths, request IDs, user identifiers, and body values remain parsed fields rather than labels.

### Serialization Rules

- JSON and text bodies are serialized deterministically and capped independently at 256 KiB.
- A truncated body includes its original byte count and `truncated: true`.
- Exception stacks are capped at 64 KiB, and the final serialized event has a 1 MiB hard limit. If metadata would exceed the remaining budget, it is truncated with byte-count metadata before emission.
- Circular, unsupported, or throwing values produce an explicit serialization marker.
- Buffers and uploaded binary contents are never serialized.
- Event construction and stdout writing are best effort and must never throw into request processing.
- The response recorded for an exception matches Nest's public error response. Internal exception details and stacks are stored in separate exception fields and are not added to the client response.

## Monitoring Stack

### Alloy

Alloy runs as a constrained collector with:

- A read-only mount of Docker's container log directory.
- A persistent positions volume so restarts resume from the last processed entry.
- Parsing stages for the outer Docker JSON record and inner structured failure event.
- A filter that drops all records except `http_failure` events from the backend service.
- Batching and retry behavior toward the private Loki endpoint.

Docker's existing `json-file` rotation (`10m`, three files) acts as a short recovery buffer while Alloy or Loki is unavailable.

### Loki

Loki runs in monolithic mode with local filesystem and TSDB storage, which is appropriate for this staging volume. It has:

- A 48-hour retention period enforced by the compactor.
- A 1 MiB maximum accepted line size.
- Conservative ingestion rate and burst limits.
- A persistent named volume.
- No public host port.
- A health check and container resource limits.

Retention cleanup is asynchronous, so the operator reserves at least 8 GB of free host disk. The expected Loki volume target is below 5 GB. If staging failure volume or average body size invalidates that budget, capture must be disabled or body limits reduced before adding disk.

### Grafana

Grafana is configured and provisioned from version-controlled files:

- Loki data source.
- Backend failure dashboard.
- Anonymous organization access limited to the Viewer role inside the loopback-only service.
- User registration and direct external access disabled.
- Public root URL `https://api-treely.arkaes.dev/log/` with subpath serving enabled.
- Persistent data volume for Grafana state.
- Five-second minimum refresh interval.

Dashboard authentication is enforced by Caddy Basic Authentication using one shared username and a hashed password stored in host-only Caddy configuration. Grafana administrator credentials remain separate and are not shared with frontend developers. This gives the team read-only access without distributing an administrative Grafana account.

## Dashboard Experience

The provisioned dashboard opens directly to backend failures and provides:

- Time range selection and five-second automatic refresh.
- Environment, status, method, path/request-ID search controls.
- Total failure, `4xx`, `5xx`, and p95 duration summaries.
- A log list showing time, status, method, path, duration, and request ID.
- Expandable structured details for overview, request body, response body, headers, upload metadata, and exception data.
- A direct path from a summary row to the complete structured Loki record.

The dashboard uses Grafana's normal responsive operational layout. It does not add a separate custom frontend application.

## Caddy Routing

The existing `api-treely.arkaes.dev` site handles the Grafana path before the catch-all API route:

```caddy
api-treely.arkaes.dev {
    @logMonitor path /log /log/*
    handle @logMonitor {
        basic_auth {
            {$LOG_MONITOR_USERNAME} {$LOG_MONITOR_PASSWORD_HASH}
        }
        reverse_proxy 127.0.0.1:3002 {
            header_up -Authorization
        }
    }

    handle {
        reverse_proxy 127.0.0.1:3001
    }
}
```

The exact existing backend upstream is preserved when this block is applied. Grafana receives the `/log` prefix and uses:

```env
GF_SERVER_DOMAIN=api-treely.arkaes.dev
GF_SERVER_ROOT_URL=https://api-treely.arkaes.dev/log/
GF_SERVER_SERVE_FROM_SUB_PATH=true
GF_SERVER_ENFORCE_DOMAIN=true
```

Caddy continues to provide HTTPS and WebSocket proxying. Loki and Alloy are not routed.

## Configuration And Deployment

New monitoring configuration lives under `apps/backend/monitoring/`. Container images use reviewed, immutable versions consistent with the repository's deployment policy.

The Compose stack adds the three monitoring services, private network wiring, health checks, resource limits, volumes, and loopback-only Grafana port. CI validates Compose and the checked-in monitoring configuration.

The deployment workflow copies monitoring configuration to the VPS and attempts to start or update the monitoring services. Monitoring failure is reported clearly but does not roll back or stop a healthy backend deployment. Backend release rollback remains independent from monitoring container versions and data volumes.

The deployment runbook includes:

1. Generate a Caddy-compatible password hash without committing the plaintext password.
2. Add the username and hash to the host's Caddy environment/configuration.
3. Validate and reload Caddy.
4. Set `LOG_MONITOR_ENABLED=true` only in staging.
5. Start the monitoring services and verify their health.
6. Trigger controlled `400` and `500` responses and verify dashboard visibility.

## Failure Handling

- Failure-event serialization or stdout errors are swallowed after a minimal fallback log attempt.
- Alloy, Loki, or Grafana downtime does not alter API status, body, or latency beyond local event serialization.
- Alloy retries Loki delivery while source log files remain available.
- Caddy returns a gateway error for `/log/` if Grafana is down; API routes remain unaffected.
- Invalid monitoring configuration fails CI validation and is rejected before deployment.
- The monitor never recursively captures Grafana, Loki, or Alloy requests because those requests do not enter NestJS.

## Testing

### Unit Tests

- Request ID acceptance, rejection, generation, and response propagation.
- Serializer behavior for JSON, text, circular values, buffers, unsupported values, and throwing accessors.
- Independent request/response truncation at 256 KiB with original byte counts.
- Upload metadata extraction without binary contents.
- Event construction for HTTP exceptions and unknown exceptions.
- Middleware/filter deduplication, response write compatibility, and writer failure isolation.

### Integration Tests

- Validation, guard, controller, and unknown errors produce exactly one structured event.
- Non-exceptional `4xx/5xx` responses are recorded.
- `2xx/3xx` responses are not recorded.
- Existing client-facing status, headers, and bodies remain unchanged.
- Disabled capture produces no structured events.

### Configuration And Staging Tests

- Typecheck, lint, unit tests, integration tests, and backend build.
- `docker compose config` validation and monitoring configuration validation.
- Container health for Alloy, Loki, and Grafana.
- Caddy config validation before reload.
- Login rejection without the shared credential and read-only access with it.
- Five-second refresh, filters, complete detail inspection, and request-ID lookup.
- Persistence across monitoring container restarts.
- Expiry of records after the configured retention window, allowing for compactor delay.

## Rollout

The first rollout is staging-only. After deployment, the team observes CPU, memory, ingestion, and disk use for at least 48 hours. Production remains disabled. A separate production decision must introduce sensitive-field redaction, confirm at-rest encryption, define access audit requirements, and reassess retention and availability.
