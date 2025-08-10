// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isDeleted: false }).select('-password');
  }

  async findById(id: string): Promise<User> {
    console.log(id);
    const user = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: dto }, { new: true })
      .select('-password');
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await user.save();
    return 'Password updated successfully';
  }

  async softDelete(id: string): Promise<string> {
    const user = await this.userModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    if (!user) throw new NotFoundException('User not found');
    return 'User soft deleted successfully';
  }

  async updateAvatar(userId: string, avatarPath: string | null): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { avatar: avatarPath } },
        { new: true },
      )
      .select('-password');

    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async ensureAdminExists() {
    const adminEmail = 'admin@issueReporter.com';
    const existingAdmin = await this.findByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await this.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`✅ Admin created with email: ${adminEmail}`);
    }
  }
}
