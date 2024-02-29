import { MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @MinLength(3)
  @MaxLength(20)
  title: string;

  @MinLength(3)
  @MaxLength(50)
  description: string;
}
