import { validateEnvironment } from './env.validation'

describe('validateEnvironment', () => {
  it('normalizes test defaults', () => {
    expect(validateEnvironment({ NODE_ENV: 'test' })).toMatchObject({
      NODE_ENV: 'test',
      PORT: 3000,
      DB_PORT: 5432,
      STORAGE_PROVIDER: 'local',
      LOG_MONITOR_ENABLED: false,
      LOG_MONITOR_ENVIRONMENT: 'test',
    })
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
})
