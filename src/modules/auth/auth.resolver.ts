/* eslint-disable @typescript-eslint/no-unused-vars */
import { MyLogger } from '../logger/my-logger.service';
import { AuthService } from './auth.service';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { SignInSucceeded } from './types/sign-in-succeeded.type';
import { LocalStrategy } from './passport/local.strategy';
import { PublicRoute } from './decorators/public-route.decorator';

@PublicRoute()
@Resolver((of) => SignInSucceeded)
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private passportLocalStrategy: LocalStrategy,
    private logger: MyLogger,
  ) {
    this.logger.setContext(AuthResolver.name);
  }

  @Mutation((returns) => Boolean, { nullable: true })
  async signUp(
    @Args('authCredentialsInput') authCredentialsInput: AuthCredentialsDto,
  ): Promise<void> {
    return await this.authService.signUp(authCredentialsInput);
  }

  @Mutation((returns) => SignInSucceeded)
  async signIn(
    @Args('authCredentialsInput') { username, password }: AuthCredentialsDto,
  ) {
    const user = await this.passportLocalStrategy.validate(username, password);
    return this.authService.signIn(user);
  }
}
