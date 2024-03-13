import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { PublicRoute } from './decorators/public-route.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../users/user.entity';
import { MyLogger } from '../logger/my-logger.service';
import { SignInSucceeded } from './types/sign-in-succeeded.type';

@PublicRoute()
@Controller('/api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  async signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SignInSucceeded> {
    this.logger.verbose(`User "${authCredentialsDto.username}" is signing up`);

    return this.authService.signUp(authCredentialsDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@GetUser() user: User) {
    this.logger.verbose(`User "${user.id}" is signing in`);

    return this.authService.signIn(user);
  }
}
