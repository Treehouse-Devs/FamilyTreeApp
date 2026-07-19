# Staging Log Monitor

The monitor captures unredacted `4xx` and `5xx` request/response details from the NestJS backend. Grafana is available at:

`${API_PUBLIC_SCHEME}://${API_PUBLIC_DOMAIN}/log/`

Do not enable it in production. Passwords, tokens, cookies, authorization headers, and personal data can appear in Loki.

## Enable On The VPS

1. Set these values in the deployment `.env`:

   ```env
   API_PUBLIC_SCHEME=https
   API_PUBLIC_DOMAIN=api.example.com
   DEPLOYMENT_ENV=staging
   LOG_MONITOR_ENABLED=true
   LOG_MONITOR_ENVIRONMENT=staging
   E2E_ADMIN_ENABLED=true
   GRAFANA_PORT=3002
   GRAFANA_ADMIN_USER=admin
   GRAFANA_ADMIN_PASSWORD_FILE=./secrets/grafana_admin_password
   ```

2. Generate the shared Caddy Basic Authentication password hash on the VPS:

   ```bash
   caddy hash-password
   ```

3. Configure `API_PUBLIC_DOMAIN`, `LOG_MONITOR_USERNAME`, and `LOG_MONITOR_PASSWORD_HASH` in Caddy's service environment. Keep the plaintext password in the team's password manager, not in this repository or the backend `.env`.

4. Merge [`Caddyfile.example`](./Caddyfile.example) into the existing public API site. Preserve the real backend upstream if it differs from `127.0.0.1:3001`.

5. Validate and reload Caddy:

   ```bash
   caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

The backend deployment script creates the Grafana administrator password file with mode `0600` when monitoring is first enabled. Frontend developers authenticate through Caddy and receive anonymous Viewer access inside loopback-only Grafana; they do not receive the Grafana administrator credential.

## Run Locally

Use the explicit local override so Grafana is served directly at
`http://localhost:3002/` without production domain enforcement:

```bash
docker build -f apps/backend/Dockerfile -t familytree/backend:local .
test -f apps/backend/.env ||
  cp apps/backend/.env.example apps/backend/.env
```

Replace every placeholder in `apps/backend/.env` and populate its required
PostgreSQL, JWT, Firebase, and SMTP values. Enable log capture and set the local
public origin:

```env
API_PUBLIC_SCHEME=http
API_PUBLIC_DOMAIN=localhost:3001
LOG_MONITOR_ENABLED=true
LOG_MONITOR_ENVIRONMENT=local
GRAFANA_ADMIN_PASSWORD_FILE=./secrets/grafana_admin_password
```

Then create the local Grafana secret and start the stack:

```bash
cd apps/backend
install -m 0700 -d secrets
test -s secrets/grafana_admin_password ||
  (umask 077 && openssl rand -hex 24 > secrets/grafana_admin_password)
BACKEND_IMAGE=familytree/backend:local docker compose \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  up -d backend loki alloy grafana
```

Do not use `docker-compose.local.yml` on staging or production.

## Staging API E2E

The `Staging API E2E` workflow runs after a successful staging deployment and can
also be dispatched manually. Configure the GitHub `staging` environment with the
same pinned `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `DEPLOY_DIR`,
`VPS_SSH_PRIVATE_KEY`, and `VPS_KNOWN_HOSTS` values used by deployment, plus an
`E2E_EMAIL_BASE` variable such as `qa@example.com`. The mailbox must accept
plus-addressed aliases.

Firebase service-account credentials stay only in the VPS `.env`. The workflow
uses the guarded CLI inside the backend container to verify and hard-delete the
two exact disposable users for its run. The CLI refuses to run unless
`DEPLOYMENT_ENV=staging` and `E2E_ADMIN_ENABLED=true`.

## Verify

```bash
docker compose ps loki alloy grafana
curl --fail http://127.0.0.1:3002/api/health
docker compose exec -T grafana wget -q -O - http://loki:3100/ready
docker compose exec -T grafana wget -q -O - http://alloy:12345/-/ready
```

Trigger a controlled failed API request, then open `/log/`. The **Backend Failed Requests** dashboard should show the event on its next 30-second refresh. Expand the log row to inspect its request, response, and exception fields.

## Disable

Set `LOG_MONITOR_ENABLED=false` and deploy again. The backend stops emitting failure events and the deployment script stops Alloy, Grafana, and Loki. Existing Loki data remains in its named volume until it is deleted explicitly.

## Resource And Disk Checks

```bash
docker stats --no-stream familytree-loki-1 familytree-alloy-1 familytree-grafana-1
docker system df
docker exec familytree-loki-1 du -sh /loki
```

Retention is 48 hours and cleanup is asynchronous. Keep at least 8 GB free on the host. Disable capture or reduce the body limit if the Loki volume approaches 5 GB.

Loki's sustained ingestion ceiling is 0.025 MB/s, which bounds 48 hours of raw accepted log data to about 4.3 GB. Its 2 MB burst allowance still accepts individual events up to the application's 1 MiB event limit.

## Reset Grafana Administrator Password

Grafana reads its initial administrator password only when creating its database. To reset an existing instance, run:

```bash
docker compose exec grafana grafana cli --homepath /usr/share/grafana admin reset-admin-password
```
