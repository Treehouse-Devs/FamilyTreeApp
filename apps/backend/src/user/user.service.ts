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
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Injectable()
export class UserService {
  constructor(private httpRequestService: HttpRequestService) {}
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

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const { idToken, refreshToken, expiresIn } =
        await this.signInWithEmailAndPassword(email, password);
      return { idToken, refreshToken, expiresIn };
    } catch (error: any) {
      if (error.message.includes("INVALID_LOGIN_CREDENTIALS")) {
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
            photoURL: decodedToken.picture,
            emailVerified: decodedToken.email_verified,
          });
        } else {
          throw error;
        }
      }

      const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid);

      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
        },
        customToken,
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

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword } = resetPasswordDto;
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
}
