import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { LoginUserDto } from "./dtos/login-user.dto";
import { GoogleAuthDto } from "./dtos/google-auth.dto";
import { HttpRequestService } from "@app/http-request";
import { FirebaseService } from './firebase.service';
import { TokenService } from './token.service';

@Injectable()
export class UserService {
  constructor(
    private httpRequestService: HttpRequestService,
    private firebaseService: FirebaseService,
    private tokenService: TokenService,
  ) {}
  async signUp(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;
    return this.firebaseService.createUser({ displayName: name, email, password });
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      await this.signInWithEmailAndPassword(email, password);
      const userRecord = await this.firebaseService.getUserByEmail(email);
      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = this.tokenService.createJwtTokens(userRecord);
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
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
    
      let userRecord;
      try {
        if (!decodedToken.email) {
          throw new UnauthorizedException("Email not found in Google token");
        }
        userRecord = await this.firebaseService.getUserByEmail(decodedToken.email);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          if (!decodedToken.email) {
            throw new UnauthorizedException("Email not found in Google token");
          }
          userRecord = await this.firebaseService.createUser({
            email: decodedToken.email,
            displayName: decodedToken.name,
          });
        } else {
          throw error;
        }
      }

      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = this.tokenService.createJwtTokens(userRecord);
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
      const userRecord = await this.firebaseService.getUserByEmail(email);
      await this.firebaseService.updateUserPassword(userRecord.uid, newPassword);
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
    const stored = this.tokenService.validateRefreshToken(uid, refreshToken);
    const userRecord = await this.firebaseService.getUser(uid);
    const { accessToken, expiredAt } = this.tokenService.createJwtTokens(userRecord);
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
      await this.firebaseService.deleteUser(uid);
      this.tokenService.deleteRefreshToken(uid);
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
