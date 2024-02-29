import { MinLength, MaxLength } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskTitleDto implements Partial<CreateTaskDto> {
  @MinLength(3)
  @MaxLength(20)
  title: string;
}
