export const authMocks = {
  'auth/login': {
    accessToken: 'mock-access-token-123',
    refreshToken: 'mock-refresh-token-456',
    expiredAt: Date.now() + 3600000,
    refreshTokenExpiredAt: Date.now() + 86400000,
    message: 'Login successful',
    user: {
      uid: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
      email: 'mock@example.com',
      displayName: 'Mock User',
      providerData: [],
    },
  },
}
