import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD, jwtSignOptions } from './auth.constants';
import { JwtStrategy } from './passport/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerModule } from '../logger/logger.modules';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    UserModule,
    LoggerModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSignOptions.secret,
      signOptions: {
        expiresIn: jwtSignOptions.expiresIn,
      },
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
