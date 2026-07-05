import { validateEnvironment } from './env.validation'

describe('validateEnvironment', () => {
  it('normalizes test defaults', () => {
    expect(validateEnvironment({ NODE_ENV: 'test' })).toMatchObject({
      NODE_ENV: 'test',
      PORT: 3000,
      DB_PORT: 5432,
      STORAGE_PROVIDER: 'local',
    })
  })

  it('rejects an invalid port', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'test', PORT: '70000' })).toThrow('PORT')
  })

  it('requires production secrets', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production' })).toThrow('DB_HOST')
  })
})
