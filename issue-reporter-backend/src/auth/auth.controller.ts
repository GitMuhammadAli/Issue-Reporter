import { Body, Controller, Post , Get , Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { username: string; email: string; password: string }) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
  @UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req: ExpressRequest & { user?: any }) {
  return req.user; // userId, email, role
}

}
