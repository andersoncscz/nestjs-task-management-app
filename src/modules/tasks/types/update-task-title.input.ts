/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType } from '@nestjs/graphql';
import { MinLength, MaxLength, IsUUID } from 'class-validator';
import { UUID_VERSION } from '../../../constants';

@InputType()
export class UpdateTaskTitleInput {
  @IsUUID(UUID_VERSION)
  @Field((_type) => String)
  id: string;

  @MinLength(3)
  @MaxLength(20)
  @Field((_type) => String)
  title: string;
}
