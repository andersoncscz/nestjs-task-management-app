import { Injectable } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInSucceeded } from './types/sign-in-succeeded.type';
import { UserService } from '../users/user.service';
import { comparePassword } from './utils/auth.utils';
import { User } from '../users/user.entity';
import { JwtPayload } from './types/jwt-payload.type';
import { jwtSignOptions } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return await this.userService.signUp(authCredentialsDto);
  }

  async signIn(user: User): Promise<SignInSucceeded> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtSignOptions.secret,
      }),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    const passwordMatches = await comparePassword(pass, user.password);

    if (user && passwordMatches) {
      return user;
    }

    return null;
  }
}
