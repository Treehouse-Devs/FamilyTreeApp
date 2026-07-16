const ENVIRONMENTS = new Set(['development', 'production', 'test'])
const DEPLOYMENT_ENVIRONMENTS = new Set(['development', 'staging', 'production', 'test'])
const STORAGE_PROVIDERS = new Set(['local', 'firebase'])

function requireValue(config: Record<string, unknown>, key: string): void {
  if (typeof config[key] !== 'string' || config[key].trim() === '') {
    throw new Error(`Environment variable ${key} is required`)
  }
}

function parsePort(value: unknown, fallback: number, key: string): number {
  const port = Number(value ?? fallback)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${key} must be an integer between 1 and 65535`)
  }

  return port
}

function parseBoolean(value: unknown, fallback: boolean, key: string): boolean {
  if (value === undefined) {
    return fallback
  }
  if (value === true || value === 'true') {
    return true
  }
  if (value === false || value === 'false') {
    return false
  }

  throw new Error(`${key} must be true or false`)
}

function parseEnvironmentLabel(value: unknown, fallback: string): string {
  const label = typeof value === 'string' ? value : fallback
  if (!/^[a-z0-9_-]{1,32}$/i.test(label)) {
    throw new Error('LOG_MONITOR_ENVIRONMENT must contain only letters, numbers, underscores, or hyphens')
  }

  return label
}

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const nodeEnv = typeof config.NODE_ENV === 'string' ? config.NODE_ENV : 'development'
  if (!ENVIRONMENTS.has(nodeEnv)) {
    throw new Error('NODE_ENV must be development, production, or test')
  }
  const deploymentEnv = typeof config.DEPLOYMENT_ENV === 'string'
    ? config.DEPLOYMENT_ENV
    : nodeEnv
  if (!DEPLOYMENT_ENVIRONMENTS.has(deploymentEnv)) {
    throw new Error('DEPLOYMENT_ENV must be development, staging, production, or test')
  }

  const port = parsePort(config.PORT, 3000, 'PORT')
  const databasePort = parsePort(config.DB_PORT, 5432, 'DB_PORT')
  const smtpPort = parsePort(config.SMTP_PORT, 465, 'SMTP_PORT')
  const logMonitorEnabled = parseBoolean(config.LOG_MONITOR_ENABLED, false, 'LOG_MONITOR_ENABLED')
  const e2eAdminEnabled = parseBoolean(config.E2E_ADMIN_ENABLED, false, 'E2E_ADMIN_ENABLED')
  const logMonitorEnvironment = parseEnvironmentLabel(config.LOG_MONITOR_ENVIRONMENT, nodeEnv)

  const storageProvider = typeof config.STORAGE_PROVIDER === 'string' ? config.STORAGE_PROVIDER : 'local'
  if (!STORAGE_PROVIDERS.has(storageProvider)) {
    throw new Error('STORAGE_PROVIDER must be local or firebase')
  }

  if (nodeEnv !== 'test') {
    const requiredKeys = [
      'DB_HOST',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'FB_PROJECT_ID',
      'FB_CLIENT_EMAIL',
      'FB_PRIVATE_KEY',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM',
      'APP_URL',
    ]
    requiredKeys.forEach(key => requireValue(config, key))

    if (String(config.JWT_SECRET).length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters')
    }

    if (storageProvider === 'firebase') {
      requireValue(config, 'FB_STORAGE_BUCKET')
    }
  }
  if (e2eAdminEnabled && deploymentEnv !== 'staging') {
    throw new Error('E2E_ADMIN_ENABLED may only be true when DEPLOYMENT_ENV=staging')
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    DEPLOYMENT_ENV: deploymentEnv,
    PORT: port,
    DB_PORT: databasePort,
    SMTP_PORT: smtpPort,
    STORAGE_PROVIDER: storageProvider,
    LOG_MONITOR_ENABLED: logMonitorEnabled,
    LOG_MONITOR_ENVIRONMENT: logMonitorEnvironment,
    E2E_ADMIN_ENABLED: e2eAdminEnabled,
  }
}
