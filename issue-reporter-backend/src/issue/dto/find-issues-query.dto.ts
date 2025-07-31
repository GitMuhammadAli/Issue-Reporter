import { IsOptional, IsIn, IsNumber, IsString, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FindIssuesQueryDto {
  @IsOptional()
  @IsIn(['open', 'closed'], { message: 'Status must be open or closed' })
  status?: string;

  @IsOptional()
  @IsIn(['user', 'admin'], { message: 'Role must be user or admin' })
  role?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;


  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['latest', 'oldest', 'most-upvoted'], { message: 'Sort must be latest, oldest, or most-upvoted' })
  sort?: 'latest' | 'oldest' | 'most-upvoted' = 'latest';
}
