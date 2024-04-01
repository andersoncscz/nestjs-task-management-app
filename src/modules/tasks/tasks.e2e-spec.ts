import { HttpStatus, INestApplication } from '@nestjs/common';
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
import { TasksResolver } from './tasks.resolver';
import { UsersRepository } from '../users/users.repository';
import { userProviders } from '../users/user.providers';
import { userMock } from '../users/users.test-data';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { jwtSignOptions } from '../auth/auth.constants';
import * as request from 'supertest';
import { User } from '../users/user.entity';
import { Task } from './task.entity';

describe('Tasks', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tasksRepository: TasksRepository;
  let usersRepository: UsersRepository;
  let jwtService: JwtService;
  let jwt: string;
  let testUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        ...databaseProviders,
        ...taskProviders,
        ...userProviders,
        TasksRepository,
        UsersRepository,
        JwtService,
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
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);

    const { username, password } = userMock;
    const authCredentialsDto: AuthCredentialsDto = {
      username,
      password,
    };

    testUser = await usersRepository.create(authCredentialsDto);
    const payload: JwtPayload = {
      sub: testUser.id,
      username: testUser.username,
    };

    jwt = jwtService.sign(payload, {
      secret: jwtSignOptions.secret,
    });
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
    describe('/GET /api/tasks', () => {
      it('gets tasks', async () => {
        const task1 = await tasksRepository.create(
          { title: 'Task 1', description: 'task 1' },
          testUser,
        );

        const task2 = await tasksRepository.create(
          { title: 'Task 2', description: 'task 2' },
          testUser,
        );

        const expectedResponseBody: Task[] = [task1, task2];

        return await request(app.getHttpServer())
          .get('/api/tasks')
          .send()
          .set({
            authorization: `Bearer ${jwt}`,
          })
          .expect(HttpStatus.OK)
          .expect(({ text }) => {
            const responseBody = JSON.parse(text) as Task[];
            const taskIds = responseBody.map((task) => task.id);
            expectedResponseBody.map((task) => {
              expect(taskIds.includes(task.id)).toBeTruthy();
            });

            expect(responseBody.length).toEqual(expectedResponseBody.length);
          });
      });
    });
  });

  describe(TasksResolver, () => {
    it('TODO: Add tests', () => {
      expect(tasksRepository).toBeDefined();
    });
  });
});
