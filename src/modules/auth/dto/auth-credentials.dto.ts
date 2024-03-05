/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType('AuthCredentialsInput')
export class AuthCredentialsDto {
  @IsEmail()
  @Field((_type) => String)
  username: string;

  @IsString()
  @MinLength(8)
  @Field((_type) => String)
  password: string;
}
