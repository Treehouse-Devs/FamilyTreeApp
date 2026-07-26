/**
 * Decorator-free entry point for browser clients.
 *
 * `index.ts` starts with a side-effecting `import 'reflect-metadata'` and re-exports
 * NestJS DTO classes carrying class-validator decorators. That is exactly what the
 * backend needs, but a bundler cannot tree-shake any of it, so a web client that
 * only wants `Gender` still pays ~39 KB for the validation runtime.
 *
 * This module exports the same shapes with no runtime decorator dependency:
 *   - the two enums, which are genuine runtime values
 *   - everything else as `export type`, which erases at build time
 *
 * Purely additive — `index.ts` and every existing import path are untouched, so
 * the backend and the React Native app are unaffected. Resolves via the package's
 * existing `"./*": "./src/*.ts"` export map as `@treely/dto/client`.
 */

// Runtime values.
export { Gender } from './profile/gender.enum'
export { RelationType } from './member/relation-type.enum'

// Family / tree shapes.
export type {
  FlatPersonDto,
  FlatTreeDto,
  PersonDto,
  TreeDto,
  TreesDto,
  UploadFamilyImageResponseDto,
} from './family/family-response.dto'

// Member shapes.
export type {
  DetailedPersonDto,
  UploadMemberImageResponseDto,
} from './member/member-response.dto'

// Auth shapes. The DTO classes are exported as types only: the client uses them
// to describe request payloads, never to instantiate or validate.
export type {
  LoginResponseDto,
  UserInfo,
  UserResponse,
} from './auth/login-user.dto'

// User / profile shapes.
export type { UserResponseDto } from './user/user-response.dto'
export type { ProfileResponseDto } from './profile/profile-response.dto'

// Request payload shapes. Exported as types only — the decorated classes are the
// source of truth, but nothing here needs their runtime validation behaviour.
export type { CreateFamilyMemberDto } from './member/create-family-member.dto'
export type { PatchFamilyMemberDto } from './member/patch-family-member-dto'
export type { RegisterUserDto, RegisterResponseDto } from './auth/register-user.dto'
