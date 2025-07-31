import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFiles,
  Query,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import type { File as MulterFile } from 'multer';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueOwnerGuard } from './guards/issue-owner.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import { FindIssuesQueryDto } from './dto/find-issues-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';


const storage = diskStorage({
  destination: (req, file, cb) => {
    const user = req.user as any;
    const userFolder = `./uploads/issues/${user.userId}`;
    if (!existsSync(userFolder)) {
      mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const unique = `${uuid()}${extname(file.originalname)}`;
    cb(null, unique);
  },
});

const fileFilter = (req: Request, file: MulterFile, cb: Function) => {
  const allowedTypes = /jpeg|jpg|png|mp4|webm/;
  const ext = extname(file.originalname).toLowerCase().slice(1);
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

@Controller('issues')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  @Throttle({ '': { limit: 5, ttl: 60 } })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @Body() dto: CreateIssueDto,
    @Req() req: Request,
    @UploadedFiles() files: MulterFile[],
  ) {
    const user = req.user as any;
    const mediaUrls = files?.map(
      (file) => `/issues/media/${user.userId}/${file.filename}`,
    );
    return this.issueService.create({
      ...dto,
      userId: user.userId,
      mediaUrls,
    });
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: FindIssuesQueryDto,
  ) {
    return this.issueService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, IssueOwnerGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateIssueDto) {
    return this.issueService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, IssueOwnerGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.issueService.delete(id);
  }

  @Get('media/:userId/:filename')
  @UseGuards(JwtAuthGuard)
  @Roles('user', 'admin')
  async serveMedia(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const reqUser = req.user as any;
    const isOwner = reqUser.userId === userId;
    const isAdmin = reqUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new NotFoundException();
    }

    const filePath = join(process.cwd(), 'uploads', 'issues', userId, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException();
    }

    const stream = createReadStream(filePath);
    stream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
@Post(':id/upvote')
async upvote(@Param('id') id: string, @Req() req: Request) {
  const user = req.user as any;
  return this.issueService.upvote(id, user.userId);
}
}
