/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsEnum, IsOptional, MaxLength, MinLength } from 'class-validator';
import { TaskStatus } from '../types/task.status.enum';
import { Field, InputType } from '@nestjs/graphql';

@InputType('GetTasksFilterInput')
export class GetTasksFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  @Field((_type) => TaskStatus, {
    nullable: true,
  })
  status?: TaskStatus;

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @Field((_type) => String, {
    nullable: true,
  })
  search?: string;
}
