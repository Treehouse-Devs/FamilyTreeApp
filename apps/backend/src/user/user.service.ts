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
import { HttpRequestService } from "@app/http-request";

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
}
