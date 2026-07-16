# Staging Log Monitor

The monitor captures unredacted `4xx` and `5xx` request/response details from the NestJS backend and makes them available in Grafana at:

`https://api-treely.arkaes.dev/log/`

Do not enable it in production. Passwords, tokens, cookies, authorization headers, and personal data can appear in Loki.

## Enable On The VPS

1. Set these values in the deployment `.env`:

   ```env
   LOG_MONITOR_ENABLED=true
   LOG_MONITOR_ENVIRONMENT=staging
   GRAFANA_PORT=3002
   GRAFANA_ADMIN_USER=admin
   GRAFANA_ADMIN_PASSWORD_FILE=./secrets/grafana_admin_password
   ```

2. Generate the shared Caddy Basic Authentication password hash on the VPS:

   ```bash
   caddy hash-password
   ```

3. Configure `LOG_MONITOR_USERNAME` and `LOG_MONITOR_PASSWORD_HASH` in Caddy's service environment. Keep the plaintext password in the team's password manager, not in this repository or the backend `.env`.

4. Merge [`Caddyfile.example`](./Caddyfile.example) into the existing `api-treely.arkaes.dev` site. Preserve the real backend upstream if it differs from `127.0.0.1:3001`.

5. Validate and reload Caddy:

   ```bash
   caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

The backend deployment script creates the Grafana administrator password file with mode `0600` when monitoring is first enabled. Frontend developers authenticate through Caddy and receive anonymous Viewer access inside loopback-only Grafana; they do not receive the Grafana administrator credential.

## Verify

```bash
docker compose ps loki alloy grafana
curl --fail http://127.0.0.1:3002/api/health
docker compose exec -T grafana wget -q -O - http://loki:3100/ready
docker compose exec -T grafana wget -q -O - http://alloy:12345/-/ready
```

Trigger a controlled failed API request, then open `/log/`. The **Backend Failed Requests** dashboard should show the event within five seconds. Expand the log row to inspect its request, response, and exception fields.

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
