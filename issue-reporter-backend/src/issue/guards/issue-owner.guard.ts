import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IssueService } from '../issue.service';

@Injectable()
export class IssueOwnerGuard implements CanActivate {
  constructor(
    private issuesService: IssueService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const issueId = req.params.id;
    const issue = await this.issuesService.findOne(issueId);

    if (!issue) throw new ForbiddenException('Issue not found');

    if (user.role === 'admin') return true;

    if (issue.userId.toString() === user.userId) {
      return true;
    }

    throw new ForbiddenException('You do not have access to this resource');
  }
}
