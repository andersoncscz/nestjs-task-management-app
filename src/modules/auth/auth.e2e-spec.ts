import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import * as request from 'supertest';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { user } from '../users/users.test-data';
import { MyLogger } from '../logger/my-logger.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { databaseProviders } from '../database/database.providers';
import { userProviders } from '../users/user.providers';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { DATA_SOURCE } from '../database/constants';
import { DataSource } from 'typeorm';
import {
  cleanupDatabase,
  closeDatabaseConnection,
} from '../database/database.test-utils';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersRepository: UsersRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, JwtModule],
      providers: [
        ...databaseProviders,
        ...userProviders,
        UsersRepository,
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
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(async () => {
    await cleanupDatabase(dataSource);
  });

  afterAll(async () => {
    await cleanupDatabase(dataSource);
    await closeDatabaseConnection(dataSource);
    await app.close();
  });

  describe(AuthController, () => {
    it(`/POST /api/auth/signup`, async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: user.username,
        password: user.password,
      };

      return await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(authCredentialsDto)
        .expect(HttpStatus.CREATED);
    });

    it(`/POST /api/auth/signin`, async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: 'newuser@x.com',
        password: 'password',
      };

      await usersRepository.create(authCredentialsDto);

      return await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send(authCredentialsDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });
  });

  describe(AuthResolver, () => {
    it('TODO: add tests for GQL operations', () => {
      expect(true).toBeTruthy();
    });
  });
});
