# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes.spec.ts >> staging API route coverage >> POST /trees creates independent trees for both users
- Location: test/staging-api/routes.spec.ts:129:7

# Error details

```
Error: POST /trees (e2e-local-1784466091226-tree-create-a)

expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 500
```

# Test source

```ts
  1   | import { expect } from '@playwright/test'
  2   | import type { APIRequestContext, APIResponse, TestInfo } from '@playwright/test'
  3   | import { spawnSync } from 'node:child_process'
  4   | 
  5   | /* eslint-disable @typescript-eslint/no-explicit-any */
  6   | 
  7   | export const STAGING_URL = 'https://api-treely.arkaes.dev'
  8   | export const RUN_ID = process.env.E2E_RUN_ID ?? 'local-list-only'
  9   | const counters = new Map<string, number>()
  10  | 
  11  | const REDACTED_KEYS = /authorization|cookie|password|token|secret/i
  12  | 
  13  | function sanitize(value: unknown): unknown {
  14  |   if (Array.isArray(value)) {
  15  |     return value.map(sanitize)
  16  |   }
  17  |   if (value && typeof value === 'object') {
  18  |     return Object.fromEntries(Object.entries(value).map(([key, nested]) => [
  19  |       key,
  20  |       REDACTED_KEYS.test(key) ? '[REDACTED]' : sanitize(nested),
  21  |     ]))
  22  |   }
  23  | 
  24  |   return value
  25  | }
  26  | 
  27  | async function responseBody(response: APIResponse): Promise<unknown> {
  28  |   const contentType = response.headers()['content-type'] ?? ''
  29  |   if (contentType.includes('json')) {
  30  |     return response.json().catch(() => '[Invalid JSON]')
  31  |   }
  32  | 
  33  |   return response.text().catch(() => '[Unreadable response]')
  34  | }
  35  | 
  36  | function nextRequestId(caseName: string): string {
  37  |   const count = (counters.get(caseName) ?? 0) + 1
  38  |   counters.set(caseName, count)
  39  |   const suffix = count === 1 ? '' : `-${count}`
  40  | 
  41  |   return `e2e-${RUN_ID}-${caseName}${suffix}`
  42  | }
  43  | 
  44  | export interface StagingRequestOptions {
  45  |   token?: string
  46  |   data?: unknown
  47  |   multipart?: Record<string, string | number | boolean | {
  48  |     name: string
  49  |     mimeType: string
  50  |     buffer: Buffer
  51  |   }>
  52  | }
  53  | 
  54  | export async function stagingRequest(
  55  |   request: APIRequestContext,
  56  |   testInfo: TestInfo,
  57  |   caseName: string,
  58  |   method: string,
  59  |   path: string,
  60  |   expectedStatus: number,
  61  |   options: StagingRequestOptions = {},
  62  | ): Promise<{ response: APIResponse, body: any, requestId: string }> {
  63  |   if (process.env.STAGING_API_E2E_ENABLED !== 'true') {
  64  |     throw new Error('Set STAGING_API_E2E_ENABLED=true to contact staging')
  65  |   }
  66  |   const requestId = nextRequestId(caseName)
  67  |   const response = await request.fetch(path, {
  68  |     method,
  69  |     data: options.data,
  70  |     multipart: options.multipart,
  71  |     headers: {
  72  |       'x-request-id': requestId,
  73  |       ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
  74  |     },
  75  |   })
  76  |   const body = await responseBody(response)
  77  | 
  78  |   if (response.status() !== expectedStatus || response.headers()['x-request-id'] !== requestId) {
  79  |     const failure = sanitize({
  80  |       requestId,
  81  |       request: { method, path },
  82  |       expectedStatus,
  83  |       actualStatus: response.status(),
  84  |       echoedRequestId: response.headers()['x-request-id'],
  85  |       response: body,
  86  |       grafana: `${STAGING_URL}/log/d/backend-failures/backend-failed-requests?var-environment=staging&var-search=${encodeURIComponent(requestId)}`,
  87  |     })
  88  |     await testInfo.attach(`unexpected-${requestId}.json`, {
  89  |       body: Buffer.from(JSON.stringify(failure, null, 2)),
  90  |       contentType: 'application/json',
  91  |     })
  92  |   }
  93  | 
> 94  |   expect(response.status(), `${method} ${path} (${requestId})`).toBe(expectedStatus)
      |                                                                 ^ Error: POST /trees (e2e-local-1784466091226-tree-create-a)
  95  |   expect(response.headers()['x-request-id'], `${method} ${path} request ID echo`).toBe(requestId)
  96  | 
  97  |   return { response, body, requestId }
  98  | }
  99  | 
  100 | export function requireState<T>(
  101 |   testInfo: TestInfo,
  102 |   label: string,
  103 |   value: T | undefined,
  104 | ): T {
  105 |   if (value === undefined || value === null || value === '') {
  106 |     testInfo.annotations.push({ type: 'blocked', description: `Missing prerequisite: ${label}` })
  107 |     testInfo.skip(true, `Blocked by missing prerequisite: ${label}`)
  108 |   }
  109 | 
  110 |   return value as T
  111 | }
  112 | 
  113 | export function disposableIdentity(caseName: 'a' | 'b') {
  114 |   const emailBase = process.env.E2E_EMAIL_BASE
  115 |     ?? (process.env.STAGING_API_E2E_ENABLED === 'true' ? undefined : 'discovery@example.invalid')
  116 |   if (!emailBase) {
  117 |     throw new Error('E2E_EMAIL_BASE is required')
  118 |   }
  119 |   const match = /^([a-z0-9._-]+)@([a-z0-9.-]+)$/i.exec(emailBase)
  120 |   if (!match) {
  121 |     throw new Error('E2E_EMAIL_BASE must not already contain plus addressing')
  122 |   }
  123 |   const marker = `e2e-${RUN_ID}-${caseName}`
  124 | 
  125 |   return {
  126 |     email: `${match[1]}+${marker}@${match[2]}`.toLowerCase(),
  127 |     name: marker,
  128 |     password: 'TreelyE2E!9a',
  129 |   }
  130 | }
  131 | 
  132 | export function verifyDisposableUser(caseName: 'a' | 'b'): void {
  133 |   const required = ['VPS_HOST', 'VPS_PORT', 'VPS_USER', 'DEPLOY_DIR', 'E2E_EMAIL_BASE']
  134 |   for (const key of required) {
  135 |     if (!process.env[key]) {
  136 |       throw new Error(`${key} is required for Firebase verification`)
  137 |     }
  138 |   }
  139 |   const sshArgs = [
  140 |     '-p', process.env.VPS_PORT!,
  141 |     '-i', `${process.env.HOME}/.ssh/id_ed25519`,
  142 |     '-o', 'BatchMode=yes',
  143 |     '-o', 'ConnectTimeout=15',
  144 |     '-o', 'IdentitiesOnly=yes',
  145 |     '-o', 'StrictHostKeyChecking=yes',
  146 |     `${process.env.VPS_USER}@${process.env.VPS_HOST}`,
  147 |     'sh', '-s', '--',
  148 |     process.env.DEPLOY_DIR!,
  149 |     process.env.E2E_EMAIL_BASE!,
  150 |     RUN_ID,
  151 |     caseName,
  152 |   ]
  153 |   const script = [
  154 |     'set -eu',
  155 |     'deploy_dir=$1',
  156 |     'email_base=$2',
  157 |     'run_id=$3',
  158 |     'case_name=$4',
  159 |     'cd "$deploy_dir"',
  160 |     'docker compose exec -T -e E2E_EMAIL_BASE="$email_base" backend node scripts/staging-e2e-admin.cjs verify --run-id "$run_id" --case "$case_name"',
  161 |   ].join('\n')
  162 |   const result = spawnSync('ssh', sshArgs, {
  163 |     input: script,
  164 |     encoding: 'utf8',
  165 |     timeout: 30_000,
  166 |   })
  167 |   if (result.status !== 0) {
  168 |     throw new Error(`VPS verification failed for user ${caseName}: ${result.stderr.trim()}`)
  169 |   }
  170 | }
  171 | 
  172 | export const pngFixture = Buffer.from(
  173 |   'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  174 |   'base64',
  175 | )
  176 | 
```