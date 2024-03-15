import { INestApplication } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { DataSource } from 'typeorm';
import { TasksRepository } from './tasks.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { databaseProviders } from '../database/database.providers';
import { MyLogger } from '../logger/my-logger.service';
import { DATA_SOURCE } from '../database/constants';
import {
  cleanupDatabase,
  closeDatabaseConnection,
} from '../database/database.test-utils';
import { taskProviders } from './task.providers';

describe('Tasks', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tasksRepository: TasksRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        ...databaseProviders,
        ...taskProviders,
        TasksRepository,
        {
          provide: MyLogger,
          useValue: {
            verbose: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    dataSource = module.get<DataSource>(DATA_SOURCE);
    tasksRepository = module.get<TasksRepository>(TasksRepository);
  });

  afterEach(async () => {
    await cleanupDatabase(dataSource);
  });

  afterAll(async () => {
    await cleanupDatabase(dataSource);
    await closeDatabaseConnection(dataSource);
    await app.close();
  });

  describe(TasksController, () => {
    it('fake test', () => {
      expect(tasksRepository).toBeDefined();
    });
  });
});
