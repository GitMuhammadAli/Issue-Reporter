import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<UserDocument> {  
    const user = new this.userModel(data);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {  
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {  
    return this.userModel.findById(id).exec();
  }
}