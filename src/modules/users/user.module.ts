import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { userProviders } from './user.providers';
import { DatabaseModule } from '../database/database.module';
import { UsersRepository } from './users.repository';
import { LoggerModule } from '../logger/logger.modules';

@Module({
  imports: [DatabaseModule, LoggerModule],
  providers: [...userProviders, UserService, UsersRepository],
  exports: [UserService],
})
export class UserModule {}
