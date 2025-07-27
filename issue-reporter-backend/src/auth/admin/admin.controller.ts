import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  @Roles('user')
  @Get('dashboard')
  getAdminData(@Request() req: ExpressRequest & { user?: any }) {
    return `Hello Admin ${req.user.email}`;
  }
}
