import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaService } from "./prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { ChatGateway } from "./chat/chat.gateway";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from './chat/chat.service';
@Module({
  imports: [AuthModule,ConfigModule.forRoot({}), UserModule],
  controllers: [],
  providers: [PrismaService, ChatGateway,JwtService, ChatService],
})
export class AppModule {}
