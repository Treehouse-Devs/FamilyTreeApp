import { validateEnvironment } from './env.validation'

describe('validateEnvironment', () => {
  it('normalizes test defaults', () => {
    expect(validateEnvironment({ NODE_ENV: 'test' })).toMatchObject({
      NODE_ENV: 'test',
      DEPLOYMENT_ENV: 'test',
      PORT: 3000,
      DB_PORT: 5432,
      STORAGE_PROVIDER: 'local',
      LOG_MONITOR_ENABLED: false,
      LOG_MONITOR_ENVIRONMENT: 'test',
      E2E_ADMIN_ENABLED: false,
      API_PUBLIC_SCHEME: 'http',
      API_PUBLIC_DOMAIN: 'localhost',
      APP_URL: 'http://localhost',
    })
  })

  it('allows production runtime semantics in the staging deployment', () => {
    const required = {
      DB_HOST: 'db',
      DB_USERNAME: 'user',
      DB_PASSWORD: 'password',
      DB_NAME: 'database',
      JWT_SECRET: 'x'.repeat(32),
      FB_PROJECT_ID: 'project',
      FB_CLIENT_EMAIL: 'firebase@example.com',
      FB_PRIVATE_KEY: 'key',
      SMTP_HOST: 'smtp.example.com',
      SMTP_USER: 'smtp-user',
      SMTP_PASS: 'smtp-pass',
      SMTP_FROM: 'sender@example.com',
      API_PUBLIC_SCHEME: 'https',
      API_PUBLIC_DOMAIN: 'api-treely.arkaes.dev',
    }

    expect(validateEnvironment({
      ...required,
      NODE_ENV: 'production',
      DEPLOYMENT_ENV: 'staging',
      E2E_ADMIN_ENABLED: 'true',
    })).toMatchObject({
      NODE_ENV: 'production',
      DEPLOYMENT_ENV: 'staging',
      E2E_ADMIN_ENABLED: true,
      APP_URL: 'https://api-treely.arkaes.dev',
    })
  })

  it('refuses to enable the e2e admin outside staging', () => {
    expect(() => validateEnvironment({
      NODE_ENV: 'test',
      DEPLOYMENT_ENV: 'production',
      E2E_ADMIN_ENABLED: 'true',
    })).toThrow('only be true')
  })

  it('rejects an invalid port', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'test', PORT: '70000' })).toThrow('PORT')
  })

  it('requires production secrets', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production' })).toThrow('DB_HOST')
  })

  it('normalizes and validates log monitor enablement', () => {
    expect(validateEnvironment({ NODE_ENV: 'test', LOG_MONITOR_ENABLED: 'true' }))
      .toMatchObject({ LOG_MONITOR_ENABLED: true })
    expect(() => validateEnvironment({ NODE_ENV: 'test', LOG_MONITOR_ENABLED: 'yes' }))
      .toThrow('LOG_MONITOR_ENABLED')
  })

  it('accepts a bounded log monitor environment label', () => {
    expect(validateEnvironment({ NODE_ENV: 'test', LOG_MONITOR_ENVIRONMENT: 'staging' }))
      .toMatchObject({ LOG_MONITOR_ENVIRONMENT: 'staging' })
    expect(() => validateEnvironment({ NODE_ENV: 'test', LOG_MONITOR_ENVIRONMENT: 'not valid' }))
      .toThrow('LOG_MONITOR_ENVIRONMENT')
  })

  it('derives APP_URL from the public scheme and domain', () => {
    expect(validateEnvironment({
      NODE_ENV: 'test',
      API_PUBLIC_SCHEME: 'https',
      API_PUBLIC_DOMAIN: 'api.example.com:8443',
      APP_URL: 'https://legacy.invalid',
    })).toMatchObject({
      API_PUBLIC_SCHEME: 'https',
      API_PUBLIC_DOMAIN: 'api.example.com:8443',
      APP_URL: 'https://api.example.com:8443',
    })
  })

  it('rejects invalid public origin components', () => {
    expect(() => validateEnvironment({
      NODE_ENV: 'test',
      API_PUBLIC_SCHEME: 'ftp',
      API_PUBLIC_DOMAIN: 'api.example.com',
    })).toThrow('API_PUBLIC_SCHEME')

    for (const domain of [
      'https://api.example.com',
      'api.example.com/log',
      'api.example.com?debug=true',
      'user@api.example.com',
      'api.example.com:70000',
    ]) {
      expect(() => validateEnvironment({
        NODE_ENV: 'test',
        API_PUBLIC_SCHEME: 'https',
        API_PUBLIC_DOMAIN: domain,
      })).toThrow('API_PUBLIC_DOMAIN')
    }
  })
})
