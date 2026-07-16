#!/usr/bin/env node
'use strict'

const path = require('node:path')
const fs = require('node:fs/promises')

const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9-]{4,63}$/
const CASES = new Set(['a', 'b'])

function assertEnabled(env) {
  if (env.DEPLOYMENT_ENV !== 'staging') {
    throw new Error('Refusing staging e2e administration outside DEPLOYMENT_ENV=staging')
  }
  if (env.E2E_ADMIN_ENABLED !== 'true') {
    throw new Error('Refusing staging e2e administration unless E2E_ADMIN_ENABLED=true')
  }
}

function validateRunId(runId) {
  if (!RUN_ID_PATTERN.test(runId ?? '')) {
    throw new Error('Invalid run ID')
  }
  return runId
}

function parseEmailBase(emailBase) {
  const match = /^([a-z0-9._-]+)@([a-z0-9.-]+)$/i.exec(emailBase ?? '')
  if (!match) {
    throw new Error('E2E_EMAIL_BASE must be an email address without plus addressing')
  }
  return { local: match[1], domain: match[2] }
}

function targetFor(emailBase, runId, caseName) {
  validateRunId(runId)
  if (!CASES.has(caseName)) {
    throw new Error('Case must be a or b')
  }
  const { local, domain } = parseEmailBase(emailBase)
  const marker = `e2e-${runId}-${caseName}`
  return {
    caseName,
    email: `${local}+${marker}@${domain}`.toLowerCase(),
    displayName: marker,
  }
}

function parseArguments(argv) {
  const [command, ...rest] = argv
  if (!['verify', 'cleanup'].includes(command)) {
    throw new Error('Usage: staging-e2e-admin.cjs <verify|cleanup> --run-id ID [--case a|b]')
  }
  const values = {}
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index]
    const value = rest[index + 1]
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument: ${key ?? ''}`)
    }
    values[key.slice(2)] = value
  }
  validateRunId(values['run-id'])
  if (command === 'verify' && !CASES.has(values.case)) {
    throw new Error('verify requires --case a or --case b')
  }
  return { command, runId: values['run-id'], caseName: values.case }
}

function isUserNotFound(error) {
  return error?.code === 'auth/user-not-found'
    || error?.errorInfo?.code === 'auth/user-not-found'
}

async function getExactFirebaseUser(auth, target) {
  try {
    const user = await auth.getUserByEmail(target.email)
    if (user.email?.toLowerCase() !== target.email || user.displayName !== target.displayName) {
      throw new Error(`Firebase marker mismatch for ${target.email}`)
    }
    return user
  } catch (error) {
    if (isUserNotFound(error)) {
      return null
    }
    throw error
  }
}

async function verifyUser({ auth, target }) {
  const user = await getExactFirebaseUser(auth, target)
  if (!user) {
    throw new Error(`Firebase user not found: ${target.email}`)
  }
  if (!user.emailVerified) {
    await auth.updateUser(user.uid, { emailVerified: true })
  }
  return { email: target.email, uid: user.uid, verified: true }
}

async function removeUploadDirectories(uploadRoot, records, fileSystem = fs) {
  const directories = [
    ...records.profileIds.map(id => path.join(uploadRoot, 'users', id)),
    ...records.familyIds.map(id => path.join(uploadRoot, 'families', id)),
    ...records.memberIds.map(id => path.join(uploadRoot, 'members', id)),
  ]
  for (const directory of directories) {
    await fileSystem.rm(directory, { recursive: true, force: true })
  }
  return directories
}

async function selectCleanupRecords(client, targets, firebaseUids) {
  const emails = targets.map(target => target.email)
  const profilesResult = await client.query(
    'SELECT "id", "firebaseUid", "email", "name" FROM "users" WHERE lower("email") = ANY($1::text[])',
    [emails],
  )
  for (const profile of profilesResult.rows) {
    const target = targets.find(item => item.email === profile.email.toLowerCase())
    if (!target || profile.name !== target.displayName) {
      throw new Error(`Database marker mismatch for ${profile.email}`)
    }
  }

  const userIds = [...new Set([
    ...firebaseUids,
    ...profilesResult.rows.map(profile => profile.firebaseUid),
  ])]
  const familiesResult = userIds.length === 0
    ? { rows: [] }
    : await client.query(
      'SELECT "id" FROM "families" WHERE "createdByUid" = ANY($1::text[])',
      [userIds],
    )
  const familyIds = familiesResult.rows.map(row => row.id)
  const membersResult = familyIds.length === 0
    ? { rows: [] }
    : await client.query(
      'SELECT "id" FROM "family_members" WHERE "familyId" = ANY($1::uuid[])',
      [familyIds],
    )

  return {
    emails,
    userIds,
    profileIds: profilesResult.rows.map(row => row.id),
    familyIds,
    memberIds: membersResult.rows.map(row => row.id),
  }
}

async function deleteDatabaseRecords(client, records) {
  const counts = {
    relationships: 0,
    members: 0,
    families: 0,
    refreshTokens: 0,
    profiles: 0,
  }
  await client.query('BEGIN')
  try {
    const relationshipsTable = (await client.query(
      "SELECT to_regclass('public.family_relationships') AS relation",
    )).rows[0]?.relation
    if (records.familyIds.length > 0) {
      if (relationshipsTable) {
        counts.relationships = (await client.query(
          'DELETE FROM "family_relationships" WHERE "familyId" = ANY($1::uuid[])',
          [records.familyIds],
        )).rowCount ?? 0
      }
      counts.members = (await client.query(
        'DELETE FROM "family_members" WHERE "familyId" = ANY($1::uuid[])',
        [records.familyIds],
      )).rowCount ?? 0
      counts.families = (await client.query(
        'DELETE FROM "families" WHERE "id" = ANY($1::uuid[])',
        [records.familyIds],
      )).rowCount ?? 0
    }
    if (records.userIds.length > 0) {
      counts.refreshTokens = (await client.query(
        'DELETE FROM "refresh_tokens" WHERE "userId" = ANY($1::text[])',
        [records.userIds],
      )).rowCount ?? 0
    }
    if (records.profileIds.length > 0) {
      counts.profiles = (await client.query(
        'DELETE FROM "users" WHERE "id" = ANY($1::uuid[])',
        [records.profileIds],
      )).rowCount ?? 0
    }
    await client.query('COMMIT')
    return counts
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function cleanupRun({ auth, pool, targets, uploadRoot, fileSystem = fs }) {
  const firebaseUsers = (await Promise.all(
    targets.map(target => getExactFirebaseUser(auth, target)),
  )).filter(Boolean)
  const client = await pool.connect()
  try {
    const records = await selectCleanupRecords(
      client,
      targets,
      firebaseUsers.map(user => user.uid),
    )
    const removedDirectories = await removeUploadDirectories(uploadRoot, records, fileSystem)
    const database = await deleteDatabaseRecords(client, records)

    let deletedFirebaseUsers = 0
    for (const user of firebaseUsers) {
      try {
        await auth.deleteUser(user.uid)
        deletedFirebaseUsers += 1
      } catch (error) {
        if (!isUserNotFound(error)) {
          throw error
        }
      }
    }

    const remainingFirebaseUsers = (await Promise.all(
      targets.map(target => getExactFirebaseUser(auth, target)),
    )).filter(Boolean).length
    const remainingProfiles = Number((await client.query(
      'SELECT count(*)::int AS "count" FROM "users" WHERE lower("email") = ANY($1::text[])',
      [records.emails],
    )).rows[0]?.count ?? 0)
    const remainingRefreshTokens = records.userIds.length === 0 ? 0 : Number((await client.query(
      'SELECT count(*)::int AS "count" FROM "refresh_tokens" WHERE "userId" = ANY($1::text[])',
      [records.userIds],
    )).rows[0]?.count ?? 0)
    const remainingFamilies = records.userIds.length === 0 ? 0 : Number((await client.query(
      'SELECT count(*)::int AS "count" FROM "families" WHERE "createdByUid" = ANY($1::text[])',
      [records.userIds],
    )).rows[0]?.count ?? 0)
    const remainingMembers = records.memberIds.length === 0 ? 0 : Number((await client.query(
      'SELECT count(*)::int AS "count" FROM "family_members" WHERE "id" = ANY($1::uuid[])',
      [records.memberIds],
    )).rows[0]?.count ?? 0)
    let remainingRelationships = 0
    if (records.familyIds.length > 0) {
      const relationshipsTable = (await client.query(
        "SELECT to_regclass('public.family_relationships') AS relation",
      )).rows[0]?.relation
      if (relationshipsTable) {
        remainingRelationships = Number((await client.query(
          'SELECT count(*)::int AS "count" FROM "family_relationships" WHERE "familyId" = ANY($1::uuid[])',
          [records.familyIds],
        )).rows[0]?.count ?? 0)
      }
    }
    const remainingFiles = (await Promise.all(removedDirectories.map(async directory => {
      try {
        await fileSystem.access(directory)
        return 1
      } catch {
        return 0
      }
    }))).reduce((sum, value) => sum + value, 0)

    const remaining = {
      firebaseUsers: remainingFirebaseUsers,
      profiles: remainingProfiles,
      refreshTokens: remainingRefreshTokens,
      families: remainingFamilies,
      members: remainingMembers,
      relationships: remainingRelationships,
      files: remainingFiles,
    }
    if (Object.values(remaining).some(value => value !== 0)) {
      throw new Error(`Cleanup incomplete: ${JSON.stringify(remaining)}`)
    }

    return {
      database,
      firebaseUsers: deletedFirebaseUsers,
      files: removedDirectories.length,
      remaining,
    }
  } finally {
    client.release()
  }
}

function createRuntime(env = process.env) {
  const admin = require('firebase-admin')
  const { Pool } = require('pg')
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FB_PROJECT_ID,
        clientEmail: env.FB_CLIENT_EMAIL,
        privateKey: env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return {
    auth: admin.auth(),
    pool: new Pool({
      host: env.DB_HOST,
      port: Number(env.DB_PORT ?? 5432),
      user: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    }),
  }
}

async function main(argv = process.argv.slice(2), env = process.env) {
  assertEnabled(env)
  const args = parseArguments(argv)
  const targets = ['a', 'b'].map(caseName =>
    targetFor(env.E2E_EMAIL_BASE, args.runId, caseName))
  const runtime = createRuntime(env)
  try {
    const result = args.command === 'verify'
      ? await verifyUser({
        auth: runtime.auth,
        target: targets.find(target => target.caseName === args.caseName),
      })
      : await cleanupRun({
        auth: runtime.auth,
        pool: runtime.pool,
        targets,
        uploadRoot: path.join(process.cwd(), 'uploads'),
      })
    process.stdout.write(`${JSON.stringify(result)}\n`)
  } finally {
    await runtime.pool.end()
  }
}

module.exports = {
  assertEnabled,
  cleanupRun,
  deleteDatabaseRecords,
  main,
  parseArguments,
  selectCleanupRecords,
  targetFor,
  validateRunId,
  verifyUser,
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`${error.stack ?? error.message}\n`)
    process.exitCode = 1
  })
}
