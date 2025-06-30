import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterUserDto } from "./dtos/register-user.dto";
import * as firebaseAdmin from "firebase-admin";
import { LoginUserDto } from "./dtos/login-user.dto";
import { GoogleAuthDto } from "./dtos/google-auth.dto";
import { HttpRequestService } from "@app/http-request";
import { v4 as uuidv4 } from "uuid";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private refreshTokensStore: {
    [userId: string]: { token: string; expiredAt: number }
  } = {};

  constructor(
    private httpRequestService: HttpRequestService,
    private jwtService: JwtService,
  ) {}
  async signUp(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;
    try {
      const userRecord = await firebaseAdmin.auth().createUser({
        displayName: name,
        email,
        password,
      });

      return userRecord;
    } catch (error: any) {
      if (error.errorInfo.code === "auth/email-already-exists") {
        throw new ConflictException(error.errorInfo.message);
      } else {
        throw new InternalServerErrorException("Failed to register user");
      }
    }
  }

  private createAndStoreRefreshToken(userRecord: any) {
    const refreshToken = uuidv4();
    const refreshTokenExpiredAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
    this.refreshTokensStore[userRecord.uid] = { token: refreshToken, expiredAt: refreshTokenExpiredAt };
    return { refreshToken, refreshTokenExpiredAt };
  }

  private createJwtTokens(userRecord: any) {
    const payload = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };
    const accessToken = this.jwtService.sign(payload);
    const expiredAt = Math.floor(Date.now() / 1000) + 3600;
    const { refreshToken, refreshTokenExpiredAt } = this.createAndStoreRefreshToken(userRecord);
    return { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      await this.signInWithEmailAndPassword(email, password);
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = this.createJwtTokens(userRecord);
      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          providerData: userRecord.providerData,
        },
        accessToken,
        refreshToken,
        refreshTokenExpiredAt,
        expiredAt,
        message: "Login successful",
      };
    } catch (error: any) {
      if (error.message && error.message.includes("INVALID_LOGIN_CREDENTIALS")) {
        throw new UnauthorizedException("Invalid credentials.");
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { idToken } = googleAuthDto;

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    
      let userRecord;
      try {
        if (!decodedToken.email) {
          throw new UnauthorizedException("Email not found in Google token");
        }
        userRecord = await firebaseAdmin.auth().getUserByEmail(decodedToken.email);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          if (!decodedToken.email) {
            throw new UnauthorizedException("Email not found in Google token");
          }
          userRecord = await firebaseAdmin.auth().createUser({
            email: decodedToken.email,
            displayName: decodedToken.name,
          });
        } else {
          throw error;
        }
      }

      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = this.createJwtTokens(userRecord);
      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          providerData: userRecord.providerData,
        },
        accessToken,
        refreshToken,
        refreshTokenExpiredAt,
        expiredAt,
        message: "Google authentication successful",
      };
    } catch (error: any) {
      if (error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException("Invalid Google ID token");
      } else {
        throw new InternalServerErrorException("Google authentication failed");
      }
    }
  }

  private async signInWithEmailAndPassword(email: string, password: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`;
    try {
      return await this.httpRequestService.sendPostRequest(url, {
        email,
        password,
        returnSecureToken: true,
      });
    } catch (error: any) {
      throw error?.data?.error;
    }
  }

  async resetPassword({ email, newPassword }: { email: string; newPassword: string }) {
    try {
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      await firebaseAdmin.auth().updateUser(userRecord.uid, { password: newPassword });
      return { message: "Password reset successful" };
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException("Failed to reset password");
      }
    }
  }

  async refreshToken(uid: string, refreshToken: string) {
    const stored = this.refreshTokensStore[uid];
    const now = Math.floor(Date.now() / 1000);

    if (!stored || stored.token !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiredAt < now) {
      delete this.refreshTokensStore[uid];
      throw new UnauthorizedException('Refresh token expired');
    }

    const userRecord = await firebaseAdmin.auth().getUser(uid);
    const { accessToken, expiredAt } = this.createJwtTokens(userRecord);
    return {
      accessToken,
      expiredAt,
      refreshTokenExpiredAt: stored.expiredAt,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        providerData: userRecord.providerData,
      },
      message: 'Token refreshed successfully',
    };
  }

  async deleteUser(uid: string) {
    try {
      await firebaseAdmin.auth().deleteUser(uid);
      delete this.refreshTokensStore[uid];
      return { message: 'User deleted successfully' };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found');
      } else {
        throw new InternalServerErrorException('Failed to delete user');
      }
    }
  }
}
