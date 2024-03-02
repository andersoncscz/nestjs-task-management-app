/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { UUID_VERSION } from 'src/constants';
import { TaskStatus } from './task.status.enum';

@InputType()
export class UpdateTaskStatusInput {
  @IsUUID(UUID_VERSION)
  @Field((_type) => String)
  id: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  @Field((_type) => TaskStatus)
  status: TaskStatus;
}
