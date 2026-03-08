import { Injectable, UnauthorizedException, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common'
import * as admin from 'firebase-admin'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword as firebaseSignIn } from 'firebase/auth'
import { auth } from '../config/firebase.config'

interface FirebaseUserData {
  displayName: string
  email: string
  password?: string
}

@Injectable()
export class FirebaseService {
  // TODO: setting up actionCodeSettings
  private actionCodeSettings = {
    // set this on firebase console
    url: 'https://www.example.com/finishSignUp?cartId=1234',
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.example.ios',
    },
    android: {
      packageName: 'com.example.android',
      installApp: true,
      minimumVersion: '12',
    },
    // The domain must be configured in Firebase Hosting and owned by the project.
    linkDomain: 'custom-domain.com',
  }

  async createUser({ displayName, email, password }: { displayName: string, email: string, password?: string }) {
    try {
      const userData: FirebaseUserData = { displayName, email }
      if (password) userData.password = password
      return await admin.auth().createUser(userData)
    }
    catch (error: unknown) {
      const firebaseError = error as { errorInfo?: { code?: string, message?: string } }
      if (firebaseError.errorInfo?.code === 'auth/email-already-exists') {
        throw new ConflictException(firebaseError.errorInfo.message)
      }
      else {
        throw new InternalServerErrorException('Failed to register user')
      }
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await admin.auth().getUserByEmail(email)
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found')
      }
      throw error
    }
  }

  async getUser(uid: string) {
    try {
      return await admin.auth().getUser(uid)
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found')
      }
      throw error
    }
  }

  async updateUserPassword(uid: string, password: string) {
    try {
      return await admin.auth().updateUser(uid, { password })
    }
    catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error)
      }
      else {
        throw new InternalServerErrorException('Failed to reset password')
      }
    }
  }

  async deleteUser(uid: string) {
    try {
      await admin.auth().deleteUser(uid)
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found')
      }
      throw new InternalServerErrorException('Failed to delete user')
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      return await admin.auth().verifyIdToken(idToken)
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid Google ID token')
      }
      throw new InternalServerErrorException('Google authentication failed')
    }
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      return await firebaseSignIn(auth, email, password)
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          throw new UnauthorizedException('Invalid login credentials')
        }
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException('Sign-in failed')
    }
  }

  async generateEmailVerificationLink(email: string): Promise<string> {
    try {
      // TODO: codeActionSettings
      return admin.auth().generateEmailVerificationLink(email)
    }
    catch (error) {
      if (error instanceof FirebaseError) {
        throw new InternalServerErrorException(error.message)
      }
      else if (error instanceof Error) {
        throw new InternalServerErrorException(error)
      }
      else {
        throw new InternalServerErrorException('Unexpected error occured')
      }
    }
  }

  async generateResetPasswordLink(email: string): Promise<string> {
    try {
      // TODO: actionCodeSettings
      return admin.auth().generatePasswordResetLink(email)
    }
    catch (error) {
      if (error instanceof FirebaseError) {
        throw new InternalServerErrorException(error.message)
      }
      else if (error instanceof Error) {
        throw new InternalServerErrorException(error)
      }
      else {
        throw new InternalServerErrorException('Unexpected error occured')
      }
    }
  }
}
