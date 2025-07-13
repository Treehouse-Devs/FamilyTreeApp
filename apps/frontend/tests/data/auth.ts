export const authMocks = [
  {
    id: 'auth-login-success',
    endpoint: 'auth/login',
    method: 'post',
    enabled: true,
    responseType: 'success',
    delay: 500,
    statusCode: 200,
    description: 'Successful login with regular user',
    responseData: {
      token: 'mock-token-123',
      user: {
        id: 'user-1',
        name: 'Mock User',
        email: 'mock@example.com',
        role: 'user',
      },
    },
  },
  {
    id: 'auth-login-admin',
    endpoint: 'auth/login',
    method: 'post',
    enabled: false,
    responseType: 'success',
    delay: 500,
    statusCode: 200,
    description: 'Admin login when using admin email',
    responseData: {
      token: 'admin-token-456',
      user: {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@familytree.com',
        role: 'admin',
      },
    },
    conditions: [
      {
        field: 'body.email',
        operator: 'equals',
        value: 'admin@familytree.com',
        response: {
          token: 'admin-token-456',
          user: {
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@familytree.com',
            role: 'admin',
          },
        },
      },
    ],
  },
  {
    id: 'auth-login-invalid',
    endpoint: 'auth/login',
    method: 'post',
    enabled: false,
    responseType: 'error',
    delay: 1000,
    statusCode: 401,
    description: 'Invalid credentials error',
    responseData: {
      message: 'Invalid credentials',
      error: 'INVALID_CREDENTIALS',
    },
    conditions: [
      {
        field: 'body.password',
        operator: 'equals',
        value: 'wrong123',
        response: {
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS',
        },
      },
    ],
  },
  {
    id: 'auth-login-server-error',
    endpoint: 'auth/login',
    method: 'post',
    enabled: false,
    responseType: 'error',
    delay: 2000,
    statusCode: 500,
    description: 'Server error simulation',
    responseData: {
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    },
  },
]
