import { MaxLength, MinLength } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDescriptionDto implements Partial<CreateTaskDto> {
  @MinLength(3)
  @MaxLength(50)
  description: string;
}
