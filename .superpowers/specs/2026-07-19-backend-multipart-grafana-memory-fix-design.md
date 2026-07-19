# Backend Multipart And Grafana Memory Fix

## Goal

Make the staging backend safe to deploy with failure monitoring enabled by:

- preserving authenticated multipart uploads;
- keeping failed JSON and text request-body capture;
- keeping Grafana within its existing 512 MiB container limit; and
- reducing dashboard query pressure without making monitoring impractically slow.

## Current Failures

The failure-capture middleware attaches a `data` listener to every request before
Nest guards and interceptors run. An asynchronous authentication guard gives a
multipart request time to enter flowing mode before Multer attaches, so Multer
receives an incomplete stream and returns `Multipart: Unexpected end of form`.
The same upload succeeds when failure monitoring is disabled.

Grafana reached approximately 535 MB under its 512 MiB cgroup limit after the
backend-failure dashboard loaded. The container stayed healthy during the local
test but had no meaningful OOM headroom.

## Design

### Selective Request-Body Capture

The failure-capture middleware will attach its raw request-body listener only
when the request content type is JSON or supported text. These are the content
types for which the monitor can produce a useful captured body.

Multipart and other binary requests will continue through the normal Nest
pipeline without a monitoring listener. Upload metadata will still come from
`request.file` or `request.files` after Multer processes the request. A failed
multipart request may omit its raw binary body, which is already the intended
representation for binary content.

Request IDs, response capture, exception capture, JSON/text truncation, and
monitor enablement behavior remain unchanged.

### Grafana Memory And Refresh

The Grafana container will retain its hard `mem_limit: 512m`. Its environment
will set `GOMEMLIMIT=256MiB` so the Go runtime targets a heap size that leaves
room for the process, mapped files, SQLite, and container overhead.

The provisioned backend-failure dashboard refresh interval will change from
five seconds to 30 seconds. The minimum-refresh configuration will also be
aligned to 30 seconds so users cannot accidentally restore the high-frequency
query load through the dashboard UI.

Existing disabled analytics, update checks, plugin preinstallation, and other
resource-saving settings remain enabled.

## Testing

### Multipart Regression

Extend the existing failure-capture integration test application with:

- an asynchronous guard that delays request processing;
- a route using `FileInterceptor` and memory storage; and
- a multipart upload assertion made through Supertest.

The test must reproduce the current `Unexpected end of form` failure before the
middleware change and return the controller's successful response afterward.
It exercises the production ordering of middleware, an asynchronous auth-like
guard, and Multer rather than testing an isolated helper.

Existing tests for malformed JSON, oversized JSON, text bodies, response
capture, and disabled monitoring must continue to pass.

### Deployment Configuration

Compose rendering must verify:

- Grafana retains a 512 MiB hard memory limit;
- `GOMEMLIMIT` resolves to `256MiB`; and
- Grafana's minimum dashboard refresh interval resolves to 30 seconds.

The dashboard JSON must use a 30-second default refresh.

### Container Validation

Build and start the production backend image with the local Compose override and
the staging-like environment. Verify:

- migrations complete;
- backend and monitoring readiness endpoints pass;
- an authenticated multipart profile upload succeeds with monitoring enabled;
- a controlled failed request reaches Loki; and
- Grafana remains healthy, does not restart or OOM, and stays below approximately
  460 MiB after the dashboard is loaded.

## Acceptance Criteria

- All backend lint, typecheck, unit, and integration tests pass.
- All three image-upload route shapes remain compatible with their existing
  multipart field names.
- Failure monitoring remains enabled and captures failed JSON/text requests.
- Multipart uploads no longer fail because of the monitoring middleware.
- Grafana remains capped at 512 MiB with a 256 MiB Go memory target.
- The dashboard and server minimum refresh interval are 30 seconds.
- The isolated Docker validation leaves no test containers, volumes, users, or
  generated repository changes behind.
