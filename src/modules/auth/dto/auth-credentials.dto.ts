import { IsEmail, IsStrongPassword } from 'class-validator';

export class AuthCredentialsDto {
  @IsEmail()
  username: string;

  @IsStrongPassword()
  password: string;
}
