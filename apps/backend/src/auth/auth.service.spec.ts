jest.mock('../config/firebase.config', () => ({
  auth: {},
}))

import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Gender } from '@treely/dto'

describe('AuthService', () => {
  const firebaseService = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    verifyIdToken: jest.fn(),
  }
  const tokenService = {}
  const mailerService = {}
  const profileService = {
    createProfile: jest.fn(),
    deleteProfile: jest.fn(),
  }

  const service = new AuthService(
    firebaseService as never,
    tokenService as never,
    mailerService as never,
    profileService as never,
  )

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('removes both profile and Firebase user when registration fails after profile creation', async () => {
    const user = {
      uid: 'uid-1',
      email: 'base+e2e-run-a@example.com',
      displayName: 'e2e-run-a',
      providerData: [],
    }
    firebaseService.createUser.mockResolvedValue(user)
    profileService.createProfile.mockResolvedValue({
      id: 'profile-1',
      firebaseUid: user.uid,
      email: user.email,
      name: user.displayName,
      avatarUrl: null,
      birthDate: 0,
      gender: Gender.MALE,
      language: 'en',
    })
    jest.spyOn(service, 'sendVerificationEmail')
      .mockRejectedValue(new InternalServerErrorException('Email sending failed'))

    await expect(service.signUp({
      email: user.email,
      password: 'safe-password',
      name: user.displayName,
      birthDate: 0,
      gender: Gender.MALE,
    })).rejects.toThrow(InternalServerErrorException)

    expect(profileService.deleteProfile).toHaveBeenCalledWith(user.uid)
    expect(firebaseService.deleteUser).toHaveBeenCalledWith(user.uid)
  })

  it('preserves UnauthorizedException for an invalid Google token', async () => {
    firebaseService.verifyIdToken.mockRejectedValue(
      new UnauthorizedException('Invalid Google ID token'),
    )

    await expect(service.googleAuth({ idToken: 'invalid' }))
      .rejects.toThrow(UnauthorizedException)
  })
})
