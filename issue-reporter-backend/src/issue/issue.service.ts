import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Issue, IssueDocument } from './schema/issue.schema/issue.schema';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { FindIssuesQueryDto } from './dto/find-issues-query.dto';

@Injectable()
export class IssueService {
  constructor(
    @InjectModel(Issue.name) private issueModel: Model<IssueDocument>,
  ) {}

  async create(data: Partial<Issue>): Promise<IssueDocument> {
    return this.issueModel.create(data);
  }

  async findOne(id: string) {
    const issue = await this.issueModel
      .findOne({ _id: id, deletedAt: null }) // exclude soft-deleted
      .populate('userId', '-password');
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async update(id: string, data: Partial<Issue>) {
    return this.issueModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true },
    );
  }

  async findAll(query: FindIssuesQueryDto) {
    const { page = 1, limit = 10, status, role, search, sort = 'latest' } = query;

    const filters: any = { deletedAt: null };

    if (status) filters.status = status;
    if (role) filters.role = role;

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
const sortOptions: any = {};
if (typeof sort === 'string') {
  if (sort === 'latest') sortOptions.createdAt = -1;
  if (sort === 'oldest') sortOptions.createdAt = 1;
  if (sort === 'most-upvoted') sortOptions.upvotesCount = -1;
}
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.issueModel
        .find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.issueModel.countDocuments(filters),
    ]);

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data,
    };
  }

  async delete(id: string) {
    const issue = await this.issueModel.findById(id);
    if (!issue || issue.deletedAt) {
      throw new NotFoundException('Issue not found or already deleted');
    }

    if (issue.mediaUrls?.length > 0) {
      for (const url of issue.mediaUrls) {
        const filePath = join(process.cwd(), url);
        try {
          unlinkSync(filePath);
        } catch (err) {
          console.warn(`Could not delete file: ${filePath}`, err.message);
        }
      }
    }

    issue.deletedAt = new Date();
    await issue.save();

    return { message: 'Issue soft-deleted successfully' };
  }

  async upvote(issueId: string, userId: string) {
    const issue = await this.issueModel.findOne({
      _id: issueId,
      deletedAt: null,
    });
    if (!issue) throw new NotFoundException('Issue not found');

    if (issue.upvotes.includes(userId)) {
      throw new BadRequestException('You already upvoted this issue');
    }

    issue.upvotes.push(userId);
    await issue.save();

    return { message: 'Upvoted successfully', upvotes: issue.upvotes.length };
  }
}
