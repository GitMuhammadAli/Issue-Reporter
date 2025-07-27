import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AdminController } from './admin/admin.controller';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mysecret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
