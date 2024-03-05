/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignInSucceeded {
  @Field((_type) => String)
  access_token: string;
}
