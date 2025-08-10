import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string , role:string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ name, email, password: hashedPassword , role:role });
    return user;
  }

  async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);
  console.log('Found user:', user);

  if (!user) {
    throw new Error('Invalid credentials - user not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);

  if (!isMatch) {
    throw new Error('Invalid credentials - password mismatch');
  }

  const payload = { sub: user._id, email: user.email, role: user.role };
  return {
    access_token: this.jwtService.sign(payload),
  };
}

}
