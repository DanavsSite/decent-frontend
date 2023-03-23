import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./strategy/jwt.strategy";
@Module({
  providers: [AuthService,PrismaService,ConfigService,JwtStrategy],
  controllers: [AuthController],
  imports: [JwtModule.register({
  })]
})
export class AuthModule {}
