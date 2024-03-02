import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { DatabaseModule } from '../database/database.module';
import { TasksRepository } from './tasks.repository';
import { taskProviders } from './task.providers';
import { LoggerModule } from '../logger/logger.modules';
import { TasksResolver } from './tasks.resolver';

@Module({
  imports: [DatabaseModule, LoggerModule],
  controllers: [TasksController],
  providers: [...taskProviders, TasksService, TasksRepository, TasksResolver],
})
export class TasksModule {}
