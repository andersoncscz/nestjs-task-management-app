/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength } from 'class-validator';

@InputType('CreateTaskInput')
export class CreateTaskDto {
  @MinLength(3)
  @MaxLength(20)
  @Field((_type) => String)
  title: string;

  @MinLength(3)
  @MaxLength(50)
  @Field((_type) => String)
  description: string;
}
