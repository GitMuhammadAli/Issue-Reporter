import {
  Controller, Post, Get, Param, Body, Put, Delete,
  UseGuards, Req
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Controller('issues')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  async create(@Req() req: Request, @Body() body: CreateIssueDto) {
    const user = req.user as any;
    return this.issueService.create({ ...body, userId: user.userId });
  }

  @Get()
  async findAll() {
    return this.issueService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateIssueDto) {
    return this.issueService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.issueService.delete(id);
  }
}

