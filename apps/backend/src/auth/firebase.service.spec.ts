const mockVerifyIdToken = jest.fn()

jest.mock('../config/firebase.config', () => ({
  auth: {},
}))
jest.mock('firebase-admin', () => ({
  auth: () => ({ verifyIdToken: mockVerifyIdToken }),
}))

import { UnauthorizedException } from '@nestjs/common'
import { FirebaseService } from './firebase.service'

describe('FirebaseService', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('maps Firebase Admin invalid-token errors to 401', async () => {
    mockVerifyIdToken.mockRejectedValue({
      errorInfo: { code: 'auth/argument-error' },
    })

    await expect(new FirebaseService().verifyIdToken('invalid'))
      .rejects.toThrow(UnauthorizedException)
  })
})
