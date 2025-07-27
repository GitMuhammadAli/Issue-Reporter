import { Module } from '@nestjs/common';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Issue, IssueSchema } from './schema/issue.schema/issue.schema';

@Module({
  imports:[MongooseModule.forFeature([{ name:Issue.name , schema:IssueSchema}])],
  controllers: [IssueController],
  providers: [IssueService],
})
export class IssueModule {}

