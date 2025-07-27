// src/issue/issue.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Issue, IssueDocument } from './schema/issue.schema/issue.schema';

@Injectable()
export class IssueService {
  constructor(
    @InjectModel(Issue.name) private issueModel: Model<IssueDocument>,
  ) {}

  async create(data: Partial<Issue>):Promise<IssueDocument> {
    return this.issueModel.create(data);
  }

  async findAll() {
    return this.issueModel.find().populate('userId', '-password');
  }

  async findOne(id: string) {
    return this.issueModel.findById(id).populate('userId', '-password');
  }

  async update(id: string, data: Partial<Issue>) {
    return this.issueModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return this.issueModel.findByIdAndDelete(id);
  }
}
