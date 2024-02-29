import { IsEnum, IsOptional, MaxLength, MinLength } from 'class-validator';
import { TaskStatus } from '../types/task.status.enum';

export class GetTasksFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  search?: string;
}
