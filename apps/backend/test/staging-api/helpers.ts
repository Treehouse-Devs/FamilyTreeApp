import { expect } from '@playwright/test'
import type { APIRequestContext, APIResponse, TestInfo } from '@playwright/test'
import { spawnSync } from 'node:child_process'

/* eslint-disable @typescript-eslint/no-explicit-any */

export const STAGING_URL = 'https://api-treely.arkaes.dev'
export const RUN_ID = process.env.E2E_RUN_ID ?? 'local-list-only'
const counters = new Map<string, number>()

const REDACTED_KEYS = /authorization|cookie|password|token|secret/i

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitize)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [
      key,
      REDACTED_KEYS.test(key) ? '[REDACTED]' : sanitize(nested),
    ]))
  }

  return value
}

async function responseBody(response: APIResponse): Promise<unknown> {
  const contentType = response.headers()['content-type'] ?? ''
  if (contentType.includes('json')) {
    return response.json().catch(() => '[Invalid JSON]')
  }

  return response.text().catch(() => '[Unreadable response]')
}

function nextRequestId(caseName: string): string {
  const count = (counters.get(caseName) ?? 0) + 1
  counters.set(caseName, count)
  const suffix = count === 1 ? '' : `-${count}`

  return `e2e-${RUN_ID}-${caseName}${suffix}`
}

export interface StagingRequestOptions {
  token?: string
  data?: unknown
  multipart?: Record<string, string | number | boolean | {
    name: string
    mimeType: string
    buffer: Buffer
  }>
}

export async function stagingRequest(
  request: APIRequestContext,
  testInfo: TestInfo,
  caseName: string,
  method: string,
  path: string,
  expectedStatus: number,
  options: StagingRequestOptions = {},
): Promise<{ response: APIResponse, body: any, requestId: string }> {
  if (process.env.STAGING_API_E2E_ENABLED !== 'true') {
    throw new Error('Set STAGING_API_E2E_ENABLED=true to contact staging')
  }
  const requestId = nextRequestId(caseName)
  const response = await request.fetch(path, {
    method,
    data: options.data,
    multipart: options.multipart,
    headers: {
      'x-request-id': requestId,
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    },
  })
  const body = await responseBody(response)

  if (response.status() !== expectedStatus || response.headers()['x-request-id'] !== requestId) {
    const failure = sanitize({
      requestId,
      request: { method, path },
      expectedStatus,
      actualStatus: response.status(),
      echoedRequestId: response.headers()['x-request-id'],
      response: body,
      grafana: `${STAGING_URL}/log/d/backend-failures/backend-failed-requests?var-environment=staging&var-search=${encodeURIComponent(requestId)}`,
    })
    await testInfo.attach(`unexpected-${requestId}.json`, {
      body: Buffer.from(JSON.stringify(failure, null, 2)),
      contentType: 'application/json',
    })
  }

  expect(response.status(), `${method} ${path} (${requestId})`).toBe(expectedStatus)
  expect(response.headers()['x-request-id'], `${method} ${path} request ID echo`).toBe(requestId)

  return { response, body, requestId }
}

export function requireState<T>(
  testInfo: TestInfo,
  label: string,
  value: T | undefined,
): T {
  if (value === undefined || value === null || value === '') {
    testInfo.annotations.push({ type: 'blocked', description: `Missing prerequisite: ${label}` })
    testInfo.skip(true, `Blocked by missing prerequisite: ${label}`)
  }

  return value as T
}

export function disposableIdentity(caseName: 'a' | 'b') {
  const emailBase = process.env.E2E_EMAIL_BASE
    ?? (process.env.STAGING_API_E2E_ENABLED === 'true' ? undefined : 'discovery@example.invalid')
  if (!emailBase) {
    throw new Error('E2E_EMAIL_BASE is required')
  }
  const match = /^([a-z0-9._-]+)@([a-z0-9.-]+)$/i.exec(emailBase)
  if (!match) {
    throw new Error('E2E_EMAIL_BASE must not already contain plus addressing')
  }
  const marker = `e2e-${RUN_ID}-${caseName}`

  return {
    email: `${match[1]}+${marker}@${match[2]}`.toLowerCase(),
    name: marker,
    password: 'TreelyE2E!9a',
  }
}

export function verifyDisposableUser(caseName: 'a' | 'b'): void {
  const required = ['VPS_HOST', 'VPS_PORT', 'VPS_USER', 'DEPLOY_DIR', 'E2E_EMAIL_BASE']
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`${key} is required for Firebase verification`)
    }
  }
  const sshArgs = [
    '-p', process.env.VPS_PORT!,
    '-i', `${process.env.HOME}/.ssh/id_ed25519`,
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=15',
    '-o', 'IdentitiesOnly=yes',
    '-o', 'StrictHostKeyChecking=yes',
    `${process.env.VPS_USER}@${process.env.VPS_HOST}`,
    'sh', '-s', '--',
    process.env.DEPLOY_DIR!,
    process.env.E2E_EMAIL_BASE!,
    RUN_ID,
    caseName,
  ]
  const script = [
    'set -eu',
    'deploy_dir=$1',
    'email_base=$2',
    'run_id=$3',
    'case_name=$4',
    'cd "$deploy_dir"',
    'docker compose exec -T -e E2E_EMAIL_BASE="$email_base" backend node scripts/staging-e2e-admin.cjs verify --run-id "$run_id" --case "$case_name"',
  ].join('\n')
  const result = spawnSync('ssh', sshArgs, {
    input: script,
    encoding: 'utf8',
    timeout: 30_000,
  })
  if (result.status !== 0) {
    throw new Error(`VPS verification failed for user ${caseName}: ${result.stderr.trim()}`)
  }
}

export const pngFixture = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)
