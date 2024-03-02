import { MinLength, MaxLength } from 'class-validator';

export class UpdateTaskTitleDto {
  @MinLength(3)
  @MaxLength(20)
  title: string;
}
