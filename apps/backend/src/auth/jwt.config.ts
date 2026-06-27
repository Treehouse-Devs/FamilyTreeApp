/**
 * Returns the JWT signing secret, failing fast if it is not configured.
 *
 * Never fall back to a hardcoded default: a default secret is public knowledge
 * (it lives in source control), so anyone could forge a valid token for any user.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET is not set. Refusing to start with an insecure default secret.',
    )
  }

  return secret
}

/** Algorithm used to sign/verify access tokens. Pinned to avoid algorithm confusion. */
export const JWT_ALGORITHM = 'HS256' as const

/** Access token lifetime in seconds (1 hour). */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60

/** Refresh token lifetime in seconds (7 days). */
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7
