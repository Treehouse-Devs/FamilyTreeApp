import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { HttpRequestModule } from "@app/http-request";

@Module({
  imports: [HttpRequestModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
