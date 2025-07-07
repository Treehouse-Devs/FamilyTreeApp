import { Injectable, UnauthorizedException, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import * as admin from 'firebase-admin';

interface FirebaseUserData {
  displayName: string;
  email: string;
  password?: string;
}

@Injectable()
export class FirebaseService {
  async createUser({ displayName, email, password }: { displayName: string; email: string; password?: string }) {
    try {
      const userData: FirebaseUserData = { displayName, email };
      if (password) userData.password = password;
      return await admin.auth().createUser(userData);
    } catch (error: unknown) {
      if (error.errorInfo?.code === 'auth/email-already-exists') {
        throw new ConflictException(error.errorInfo.message);
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await admin.auth().getUserByEmail(email);
    } catch (error: unknown) {
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async getUser(uid: string) {
    try {
      return await admin.auth().getUser(uid);
    } catch (error: unknown) {
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async updateUserPassword(uid: string, password: string) {
    try {
      return await admin.auth().updateUser(uid, { password });
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async deleteUser(uid: string) {
    try {
      await admin.auth().deleteUser(uid);
    } catch (error: unknown) {
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error: unknown) {
      if (error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid Google ID token');
      }
      throw new InternalServerErrorException('Google authentication failed');
    }
  }
} 