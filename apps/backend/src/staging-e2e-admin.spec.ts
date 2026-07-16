// The production admin utility is intentionally CommonJS so it can run directly in the image.
/* eslint-disable @typescript-eslint/no-require-imports */

const {
  assertEnabled,
  cleanupRun,
  deleteDatabaseRecords,
  targetFor,
} = require('../scripts/staging-e2e-admin.cjs') as {
  assertEnabled: (env: Record<string, string>) => void
  cleanupRun: (options: Record<string, unknown>) => Promise<Record<string, unknown>>
  deleteDatabaseRecords: (
    client: { query: jest.Mock },
    records: Record<string, string[]>,
  ) => Promise<Record<string, number>>
  targetFor: (
    emailBase: string,
    runId: string,
    caseName: string,
  ) => { email: string, displayName: string }
}

describe('staging-e2e-admin', () => {
  const targets = [
    targetFor('qa@example.com', '12345-1', 'a'),
    targetFor('qa@example.com', '12345-1', 'b'),
  ]

  it('refuses to run outside staging or without explicit enablement', () => {
    expect(() => assertEnabled({
      DEPLOYMENT_ENV: 'production',
      E2E_ADMIN_ENABLED: 'true',
    })).toThrow('outside DEPLOYMENT_ENV=staging')
    expect(() => assertEnabled({
      DEPLOYMENT_ENV: 'staging',
      E2E_ADMIN_ENABLED: 'false',
    })).toThrow('E2E_ADMIN_ENABLED=true')
  })

  it('builds exact plus-address aliases and display markers', () => {
    expect(targets[0]).toMatchObject({
      email: 'qa+e2e-12345-1-a@example.com',
      displayName: 'e2e-12345-1-a',
    })
    expect(() => targetFor('qa+unsafe@example.com', '12345-1', 'a'))
      .toThrow('without plus addressing')
  })

  it('rolls back the PostgreSQL transaction on deletion failure', async () => {
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ relation: 'family_relationships' }] })
        .mockRejectedValueOnce(new Error('delete failed'))
        .mockResolvedValueOnce({}),
    }

    await expect(deleteDatabaseRecords(client, {
      familyIds: ['00000000-0000-0000-0000-000000000001'],
      memberIds: [],
      userIds: [],
      profileIds: [],
    })).rejects.toThrow('delete failed')
    expect(client.query).toHaveBeenLastCalledWith('ROLLBACK')
  })

  it('is idempotent when all Firebase, database, and file records are already absent', async () => {
    const auth = {
      getUserByEmail: jest.fn().mockRejectedValue({ code: 'auth/user-not-found' }),
      deleteUser: jest.fn(),
    }
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ relation: null }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ count: 0 }] }),
      release: jest.fn(),
    }
    const pool = { connect: jest.fn().mockResolvedValue(client) }
    const fileSystem = {
      rm: jest.fn(),
      access: jest.fn().mockRejectedValue(new Error('missing')),
    }

    const result = await cleanupRun({
      auth,
      pool,
      targets,
      uploadRoot: '/tmp/uploads',
      fileSystem,
    })

    expect(result).toMatchObject({
      firebaseUsers: 0,
      files: 0,
      remaining: { firebaseUsers: 0, profiles: 0, files: 0 },
    })
    expect(client.query).toHaveBeenCalledWith('COMMIT')
    expect(auth.deleteUser).not.toHaveBeenCalled()
  })

  it('refuses cleanup when a database email has the wrong display marker', async () => {
    const auth = {
      getUserByEmail: jest.fn().mockRejectedValue({ code: 'auth/user-not-found' }),
    }
    const client = {
      query: jest.fn().mockResolvedValue({
        rows: [{
          id: 'profile-1',
          firebaseUid: 'uid-1',
          email: targets[0].email,
          name: 'not-an-e2e-marker',
        }],
      }),
      release: jest.fn(),
    }

    await expect(cleanupRun({
      auth,
      pool: { connect: jest.fn().mockResolvedValue(client) },
      targets,
      uploadRoot: '/tmp/uploads',
    })).rejects.toThrow('Database marker mismatch')
    expect(client.release).toHaveBeenCalled()
  })

  it('refuses cleanup when a Firebase user has the wrong display marker', async () => {
    const auth = {
      getUserByEmail: jest.fn().mockResolvedValue({
        uid: 'uid-1',
        email: targets[0].email,
        displayName: 'not-an-e2e-marker',
      }),
    }
    const pool = { connect: jest.fn() }

    await expect(cleanupRun({
      auth,
      pool,
      targets,
      uploadRoot: '/tmp/uploads',
    })).rejects.toThrow('Firebase marker mismatch')
    expect(pool.connect).not.toHaveBeenCalled()
  })
})
