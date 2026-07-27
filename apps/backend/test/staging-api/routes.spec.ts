/* eslint-disable
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access
*/
import { test, expect } from '@playwright/test'
import {
  disposableIdentity,
  pngFixture,
  requireState,
  stagingRequest,
  verifyDisposableUser,
} from './helpers'

interface UserState {
  uid?: string
  accessToken?: string
  refreshToken?: string
  treeId?: string
  secondaryTreeId?: string
  rootMemberId?: string
  memberId?: string
}

const users = {
  a: disposableIdentity('a'),
  b: disposableIdentity('b'),
}
const state: { a: UserState, b: UserState } = { a: {}, b: {} }

test.describe('staging API route coverage', () => {
  test('GET /health/live', async ({ request }, testInfo) => {
    const { body } = await stagingRequest(request, testInfo, 'health-live', 'GET', '/health/live', 200)
    expect(body).toMatchObject({ status: 'ok' })
  })

  test('GET /health/ready', async ({ request }, testInfo) => {
    const { body } = await stagingRequest(request, testInfo, 'health-ready', 'GET', '/health/ready', 200)
    expect(body).toMatchObject({ status: 'ok' })
  })

  test('POST /auth/forgot-password rejects invalid payload', async ({ request }, testInfo) => {
    await stagingRequest(request, testInfo, 'forgot-invalid', 'POST', '/auth/forgot-password', 400, {
      data: {},
    })
  })

  test('POST /auth/verification-email rejects invalid payload', async ({ request }, testInfo) => {
    await stagingRequest(request, testInfo, 'verify-invalid', 'POST', '/auth/verification-email', 400, {
      data: {},
    })
  })

  test('POST /auth/google-auth preserves invalid-token 401', async ({ request }, testInfo) => {
    await stagingRequest(request, testInfo, 'google-invalid', 'POST', '/auth/google-auth', 401, {
      data: { idToken: 'invalid-e2e-token' },
    })
  })

  for (const caseName of ['a', 'b'] as const) {
    test(`POST /auth/register creates disposable user ${caseName}`, async ({ request }, testInfo) => {
      const identity = users[caseName]
      const { body } = await stagingRequest(
        request,
        testInfo,
        `register-${caseName}`,
        'POST',
        '/auth/register',
        201,
        {
          data: {
            email: identity.email,
            password: identity.password,
            name: identity.name,
            birthDate: 631152000000,
            gender: caseName === 'a' ? 'male' : 'female',
          },
        },
      )
      expect(body.user.email).toBe(identity.email)
      state[caseName].uid = body.user.uid
      verifyDisposableUser(caseName)
    })
  }

  test('POST /auth/login authenticates both verified users', async ({ request }, testInfo) => {
    for (const caseName of ['a', 'b'] as const) {
      requireState(testInfo, `registered user ${caseName}`, state[caseName].uid)
      const { body } = await stagingRequest(
        request,
        testInfo,
        `login-${caseName}`,
        'POST',
        '/auth/login',
        201,
        { data: { email: users[caseName].email, password: users[caseName].password } },
      )
      state[caseName].accessToken = body.accessToken
      state[caseName].refreshToken = body.refreshToken
    }
  })

  test('GET /profile reads the authenticated profile', async ({ request }, testInfo) => {
    const token = requireState(testInfo, 'user a access token', state.a.accessToken)
    const { body } = await stagingRequest(request, testInfo, 'profile-get', 'GET', '/profile', 200, { token })
    expect(body.email).toBe(users.a.email)
  })

  test('PATCH /profile updates profile fields', async ({ request }, testInfo) => {
    const token = requireState(testInfo, 'user a access token', state.a.accessToken)
    const { body } = await stagingRequest(request, testInfo, 'profile-patch', 'PATCH', '/profile', 200, {
      token,
      data: { birthDate: 662688000000 },
    })
    expect(body.birthDate).toBe(662688000000)
  })

  test('POST /profile/image uploads an image', async ({ request }, testInfo) => {
    const token = requireState(testInfo, 'user a access token', state.a.accessToken)
    const { body } = await stagingRequest(request, testInfo, 'profile-image', 'POST', '/profile/image', 201, {
      token,
      multipart: {
        image: { name: 'avatar.png', mimeType: 'image/png', buffer: pngFixture },
      },
    })
    expect(body.avatarUrl).toContain('/uploads/users/')
  })

  test('POST /trees creates independent trees for both users', async ({ request }, testInfo) => {
    for (const caseName of ['a', 'b'] as const) {
      const token = requireState(testInfo, `user ${caseName} access token`, state[caseName].accessToken)
      const { body } = await stagingRequest(request, testInfo, `tree-create-${caseName}`, 'POST', '/trees', 201, {
        token,
        data: { name: `${users[caseName].name}-tree` },
      })
      state[caseName].treeId = body.id
      state[caseName].rootMemberId = body.persons[0]?.id
    }
    const token = requireState(testInfo, 'user a access token', state.a.accessToken)
    const { body } = await stagingRequest(request, testInfo, 'tree-create-a-secondary', 'POST', '/trees', 201, {
      token,
      data: { name: `${users.a.name}-secondary` },
    })
    state.a.secondaryTreeId = body.id
  })

  test('GET /trees lists only owned trees', async ({ request }, testInfo) => {
    const token = requireState(testInfo, 'user a access token', state.a.accessToken)
    const { body } = await stagingRequest(request, testInfo, 'tree-list', 'GET', '/trees', 200, { token })
    expect(body.map((tree: { id: string }) => tree.id)).toContain(state.a.treeId)
    expect(body.map((tree: { id: string }) => tree.id)).not.toContain(state.b.treeId)
  })

  test('GET /trees/:id returns owned tree and hides it from another user', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user a tree', state.a.treeId)
    const tokenA = requireState(testInfo, 'user a access token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b access token', state.b.accessToken)
    await stagingRequest(request, testInfo, 'tree-get', 'GET', `/trees/${treeId}`, 200, { token: tokenA })
    await stagingRequest(request, testInfo, 'tree-get-isolation', 'GET', `/trees/${treeId}`, 404, { token: tokenB })
  })

  test('PATCH /trees/:id updates owned tree and rejects another user', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user a tree', state.a.treeId)
    const tokenA = requireState(testInfo, 'user a access token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b access token', state.b.accessToken)
    await stagingRequest(request, testInfo, 'tree-patch', 'PATCH', `/trees/${treeId}`, 200, {
      token: tokenA,
      data: { name: `${users.a.name}-tree-updated` },
    })
    await stagingRequest(request, testInfo, 'tree-patch-isolation', 'PATCH', `/trees/${treeId}`, 404, {
      token: tokenB,
      data: { name: 'unauthorized' },
    })
  })

  test('POST /trees/:treeId/image uploads only to an owned tree', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user a tree', state.a.treeId)
    const tokenA = requireState(testInfo, 'user a access token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b access token', state.b.accessToken)
    const multipart = { file: { name: 'tree.png', mimeType: 'image/png', buffer: pngFixture } }
    const { body } = await stagingRequest(request, testInfo, 'tree-image', 'POST', `/trees/${treeId}/image`, 201, {
      token: tokenA,
      multipart,
    })
    expect(body.familyImageUrl).toContain(`/uploads/families/${treeId}/`)
    await stagingRequest(request, testInfo, 'tree-image-isolation', 'POST', `/trees/${treeId}/image`, 404, {
      token: tokenB,
      multipart,
    })
  })

  test('POST /trees/:id/person creates members and rejects cross-tree relationships', async ({ request }, testInfo) => {
    for (const caseName of ['a', 'b'] as const) {
      const treeId = requireState(testInfo, `user ${caseName} tree`, state[caseName].treeId)
      const token = requireState(testInfo, `user ${caseName} token`, state[caseName].accessToken)
      const { body } = await stagingRequest(request, testInfo, `member-create-${caseName}`, 'POST', `/trees/${treeId}/person`, 201, {
        token,
        data: {
          name: `${users[caseName].name}-member`,
          gender: caseName === 'a' ? 'female' : 'male',
          birthDate: 946684800000,
          isBloodRelated: true,
          fatherId: state[caseName].rootMemberId,
        },
      })
      state[caseName].memberId = body.id
    }
    const treeId = requireState(testInfo, 'user a tree', state.a.treeId)
    const token = requireState(testInfo, 'user a token', state.a.accessToken)
    const otherMemberId = requireState(testInfo, 'user b member', state.b.memberId)
    await stagingRequest(request, testInfo, 'member-cross-tree-relation', 'POST', `/trees/${treeId}/person`, 400, {
      token,
      data: {
        name: 'invalid relationship',
        gender: 'male',
        birthDate: 946684800000,
        isBloodRelated: true,
        fatherId: otherMemberId,
      },
    })
  })

  test('GET /trees/:id/person/:personId enforces tree and user ownership', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user a tree', state.a.treeId)
    const secondaryTreeId = requireState(testInfo, 'user a secondary tree', state.a.secondaryTreeId)
    const memberId = requireState(testInfo, 'user a member', state.a.memberId)
    const tokenA = requireState(testInfo, 'user a token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b token', state.b.accessToken)
    await stagingRequest(request, testInfo, 'member-get', 'GET', `/trees/${treeId}/person/${memberId}`, 200, { token: tokenA })
    await stagingRequest(request, testInfo, 'member-get-other-tree', 'GET', `/trees/${secondaryTreeId}/person/${memberId}`, 404, { token: tokenA })
    await stagingRequest(request, testInfo, 'member-get-other-user', 'GET', `/trees/${treeId}/person/${memberId}`, 404, { token: tokenB })
  })

  test('PATCH /trees/:id/person/:personId updates only an owned member', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user a tree', state.a.treeId)
    const memberId = requireState(testInfo, 'user a member', state.a.memberId)
    const tokenA = requireState(testInfo, 'user a token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b token', state.b.accessToken)
    const { body } = await stagingRequest(request, testInfo, 'member-patch', 'PATCH', `/trees/${treeId}/person/${memberId}`, 200, {
      token: tokenA,
      data: { occupation: { occupation: 'Engineer', officeAddress: 'Staging' } },
    })
    expect(body.person.occupation.occupation).toBe('Engineer')
    await stagingRequest(request, testInfo, 'member-patch-isolation', 'PATCH', `/trees/${treeId}/person/${memberId}`, 404, {
      token: tokenB,
      data: { name: 'unauthorized' },
    })
  })

  test('POST /trees/:id/person/:personId/image uploads only for an owned member', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user a tree', state.a.treeId)
    const memberId = requireState(testInfo, 'user a member', state.a.memberId)
    const tokenA = requireState(testInfo, 'user a token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b token', state.b.accessToken)
    const multipart = { file: { name: 'person.png', mimeType: 'image/png', buffer: pngFixture } }
    const { body } = await stagingRequest(request, testInfo, 'member-image', 'POST', `/trees/${treeId}/person/${memberId}/image`, 201, {
      token: tokenA,
      multipart,
    })
    expect(body.fullImageUrl).toContain(`/uploads/members/${memberId}/`)
    await stagingRequest(request, testInfo, 'member-image-isolation', 'POST', `/trees/${treeId}/person/${memberId}/image`, 404, {
      token: tokenB,
      multipart,
    })
  })

  test('DELETE /trees/:id/person/:personId deletes only an owned member', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user b tree', state.b.treeId)
    const memberId = requireState(testInfo, 'user b member', state.b.memberId)
    const tokenA = requireState(testInfo, 'user a token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b token', state.b.accessToken)
    await stagingRequest(request, testInfo, 'member-delete-isolation', 'DELETE', `/trees/${treeId}/person/${memberId}`, 404, { token: tokenA })
    await stagingRequest(request, testInfo, 'member-delete', 'DELETE', `/trees/${treeId}/person/${memberId}`, 200, { token: tokenB })
    await stagingRequest(request, testInfo, 'member-delete-confirm', 'GET', `/trees/${treeId}/person/${memberId}`, 404, { token: tokenB })
  })

  test('DELETE /trees/:id deletes only an owned tree', async ({ request }, testInfo) => {
    const treeId = requireState(testInfo, 'user a secondary tree', state.a.secondaryTreeId)
    const tokenA = requireState(testInfo, 'user a token', state.a.accessToken)
    const tokenB = requireState(testInfo, 'user b token', state.b.accessToken)
    await stagingRequest(request, testInfo, 'tree-delete-isolation', 'DELETE', `/trees/${treeId}`, 404, { token: tokenB })
    await stagingRequest(request, testInfo, 'tree-delete', 'DELETE', `/trees/${treeId}`, 200, { token: tokenA })
    await stagingRequest(request, testInfo, 'tree-delete-confirm', 'GET', `/trees/${treeId}`, 404, { token: tokenA })
  })

  test('POST /auth/refresh-token rotates and rejects reuse', async ({ request }, testInfo) => {
    const uid = requireState(testInfo, 'user a uid', state.a.uid)
    const refreshToken = requireState(testInfo, 'user a refresh token', state.a.refreshToken)
    const { body } = await stagingRequest(request, testInfo, 'refresh-rotate', 'POST', '/auth/refresh-token', 201, {
      data: { uid, refreshToken },
    })
    expect(
      typeof body.refreshToken === 'string'
      && body.refreshToken.length > 0
      && body.refreshToken !== refreshToken,
    ).toBe(true)
    state.a.accessToken = body.accessToken
    state.a.refreshToken = body.refreshToken
    await stagingRequest(request, testInfo, 'refresh-reuse', 'POST', '/auth/refresh-token', 401, {
      data: { uid, refreshToken },
    })
  })

  test('POST /auth/reset-password changes the authenticated password', async ({ request }, testInfo) => {
    const token = requireState(testInfo, 'user a access token', state.a.accessToken)
    const newPassword = 'TreelyE2E!9b'
    await stagingRequest(request, testInfo, 'password-reset', 'POST', '/auth/reset-password', 201, {
      token,
      data: { newPassword },
    })
    const { body } = await stagingRequest(request, testInfo, 'password-login', 'POST', '/auth/login', 201, {
      data: { email: users.a.email, password: newPassword },
    })
    state.a.accessToken = body.accessToken
    state.a.refreshToken = body.refreshToken
  })

  test('DELETE /auth removes the Firebase account without changing the public contract', async ({ request }, testInfo) => {
    const token = requireState(testInfo, 'user b access token', state.b.accessToken)
    const { body } = await stagingRequest(request, testInfo, 'account-delete', 'DELETE', '/auth', 200, { token })
    expect(body).toMatchObject({ message: 'User deleted successfully' })
  })
})
