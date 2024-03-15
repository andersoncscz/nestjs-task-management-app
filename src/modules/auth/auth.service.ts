import { Injectable } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInSucceeded } from './types/sign-in-succeeded.type';
import { UserService } from '../users/user.service';
import { verifyIfPasswordIsCorrect } from './utils/auth.utils';
import { User } from '../users/user.entity';
import { JwtPayload } from './types/jwt-payload.type';
import { jwtSignOptions } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<SignInSucceeded> {
    const user = await this.userService.signUp(authCredentialsDto);

    return await this.signIn(user);
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
    let passwordIsCorrect = false;
    const user = await this.userService.findByUsername(username);

    if (user) {
      passwordIsCorrect = await verifyIfPasswordIsCorrect(pass, user.password);
      if (passwordIsCorrect) {
        return user;
      }
    }

    return null;
  }
}
