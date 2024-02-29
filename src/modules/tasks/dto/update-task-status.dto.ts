import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../types/task.status.enum';

export class UpdateTaskStatusDto {
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
