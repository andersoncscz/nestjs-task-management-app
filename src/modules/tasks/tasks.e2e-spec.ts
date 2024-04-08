import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
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
import { v4 } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { TransformInterceptor } from '../../interceptors/transform.interceptor';

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
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    dataSource = module.get<DataSource>(DATA_SOURCE);
    tasksRepository = module.get<TasksRepository>(TasksRepository);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    const { password } = userMock;
    const authCredentialsDto: AuthCredentialsDto = {
      username: `test-user-${v4()}@x.com`,
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
      it('returns all tasks that a user has', async () => {
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
          .expect(({ body }) => {
            const tasks = body as Task[];
            const taskIds = tasks.map((task) => task.id);
            expectedResponseBody.map((task) => {
              expect(taskIds.includes(task.id)).toBeTruthy();
            });

            expect(tasks.length).toBe(expectedResponseBody.length);
          });
      });

      it('returns an empty array when user has no tasks', async () => {
        return await request(app.getHttpServer())
          .get('/api/tasks')
          .send()
          .set({
            authorization: `Bearer ${jwt}`,
          })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            const tasks = body as Task[];
            expect(tasks).toEqual<Task[]>([]);
          });
      });

      it('throws a Unauthorized exception when access token is missing or expired', async () => {
        return await request(app.getHttpServer())
          .get('/api/tasks')
          .send()
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('/GET /:id/', () => {
      it('returns a task by the given id', async () => {
        const task1 = await tasksRepository.create(
          { title: 'Task 1', description: 'task 1' },
          testUser,
        );

        return await request(app.getHttpServer())
          .get(`/api/tasks/${task1.id}`)
          .send()
          .set({
            authorization: `Bearer ${jwt}`,
          })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            const taskFound = body as Task;

            expect(taskFound).toBeDefined();
            expect(taskFound.id).toBe(task1.id);
          });
      });

      it('throws a NotFound exception when the task is not found for the given id', async () => {
        return await request(app.getHttpServer())
          .get(`/api/tasks/${v4()}`)
          .send()
          .set({
            authorization: `Bearer ${jwt}`,
          })
          .expect(HttpStatus.NOT_FOUND);
      });

      it('throws a Unauthorized exception when access token is missing or expired', async () => {
        return await request(app.getHttpServer())
          .get(`/api/tasks/${v4()}`)
          .send()
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('POST /api/tasks', () => {
      it('creates a new task', async () => {
        const createTaskDto: CreateTaskDto = {
          title: 'New task',
          description: 'description',
        };

        return await request(app.getHttpServer())
          .post('/api/tasks/')
          .send(createTaskDto)
          .set({
            authorization: `Bearer ${jwt}`,
          })
          .expect(HttpStatus.CREATED)
          .expect(({ body }) => {
            const taskCreated = body as Task;

            expect(taskCreated).toBeDefined();
            expect(taskCreated.title).toBe(createTaskDto.title);
            expect(taskCreated.description).toBe(createTaskDto.description);
          });
      });

      it('throws a BadRequest exception for invalid params', async () => {
        const createTaskDto: CreateTaskDto = {
          title: 'A',
          description: 'D',
        };

        const expectedErrorMessages = [
          'title must be longer than or equal to 3 characters',
          'description must be longer than or equal to 3 characters',
        ];

        return await request(app.getHttpServer())
          .post('/api/tasks/')
          .send(createTaskDto)
          .set({
            authorization: `Bearer ${jwt}`,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((response) => {
            expect(response.body.message).toEqual<string[]>(
              expectedErrorMessages,
            );
          });
      });

      it('throws a BadRequest exception for bad or missing params', async () => {
        return await request(app.getHttpServer())
          .post('/api/tasks/')
          .set({
            authorization: `Bearer ${jwt}`,
          })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('throws a Unauthorized exception when access token is missing or expired', async () => {
        return await request(app.getHttpServer())
          .post('/api/tasks/')
          .send()
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe(TasksResolver, () => {
    it('TODO: Add tests', () => {
      expect(tasksRepository).toBeDefined();
    });
  });
});
