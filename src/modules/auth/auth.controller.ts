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
  async signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    this.logger.verbose(`User "${authCredentialsDto.username}" is signing up`);

    return await this.authService.signUp(authCredentialsDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@GetUser() user: User) {
    this.logger.verbose(`User "${user.id}" is signing in`);

    return this.authService.signIn(user);
  }
}
