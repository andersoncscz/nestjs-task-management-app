/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, ObjectType } from '@nestjs/graphql';
import { TaskStatus } from './types/task.status.enum';

@ObjectType()
export class Task {
  @Field((_type) => String)
  id: string;

  @Field((_type) => String)
  title: string;

  @Field((_type) => String)
  description: string;

  @Field((_type) => TaskStatus)
  status: TaskStatus;
}
