import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { user } from '../users/users.test-data';
import { MyLogger } from '../logger/my-logger.service';
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
import { AppModule } from '../../app.module';
import { SignInSucceeded } from './types/sign-in-succeeded.type';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersRepository: UsersRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    const { username, password } = user;

    describe('/POST /api/auth/signup', () => {
      it('signs up a user', async () => {
        const authCredentialsDto: AuthCredentialsDto = {
          username,
          password,
        };

        const expectedResponseBody: SignInSucceeded = {
          access_token: expect.any(String),
        };

        return await request(app.getHttpServer())
          .post('/api/auth/signup')
          .send(authCredentialsDto)
          .expect(HttpStatus.CREATED)
          .expect(({ text }) => {
            const responseBody = JSON.parse(text) as SignInSucceeded;

            expect(responseBody).toEqual(expectedResponseBody);
            expect(responseBody.access_token.length > 0).toBeTruthy();
          });
      });
    });

    describe('/POST /api/auth/signin', () => {
      it('signs in a user', async () => {
        const authCredentialsDto: AuthCredentialsDto = {
          username,
          password,
        };

        await usersRepository.create(authCredentialsDto);

        const expectedResponseBody: SignInSucceeded = {
          access_token: expect.any(String),
        };

        return await request(app.getHttpServer())
          .post('/api/auth/signin')
          .send(authCredentialsDto)
          .expect(HttpStatus.OK)
          .expect(({ text }) => {
            const responseBody = JSON.parse(text) as SignInSucceeded;

            expect(responseBody).toEqual(expectedResponseBody);
            expect(responseBody.access_token.length > 0).toBeTruthy();
          });
      });
    });
  });

  describe(AuthResolver, () => {
    const { username, password } = user;

    describe('mutation', () => {
      describe('signUp', () => {
        it('signs up a user', async () => {
          const signUpMutationVariables = {
            authCredentialsInput: {
              username,
              password,
            },
          };

          const expectedResponseBody: SignInSucceeded = {
            access_token: expect.any(String),
          };

          const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: `
                mutation SignUp($authCredentialsInput: AuthCredentialsInput!) {
                  signUp(authCredentialsInput: $authCredentialsInput) {
                    access_token
                  }
                }
              `,
              variables: signUpMutationVariables,
            })
            .expect(200);

          const mutationResult = response.body.data.signUp;
          expect(mutationResult).toEqual(expectedResponseBody);
          expect(mutationResult.access_token.length > 0).toBeTruthy();
        });
      });

      describe('signIn', () => {
        it('signs in a user', async () => {
          const signInMutationVariables = {
            authCredentialsInput: {
              username,
              password,
            },
          };

          await usersRepository.create({ username, password });

          const expectedResponseBody: SignInSucceeded = {
            access_token: expect.any(String),
          };

          const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: `
                mutation SignIn($authCredentialsInput: AuthCredentialsInput!) {
                  signIn(authCredentialsInput: $authCredentialsInput) {
                    access_token
                  }
                }
              `,
              variables: signInMutationVariables,
            })
            .expect(HttpStatus.OK);

          const mutationResult = response.body.data.signIn;
          expect(mutationResult).toEqual(expectedResponseBody);
          expect(mutationResult.access_token.length > 0).toBeTruthy();
        });

        it("throws 'Unauthorized' error when user exists but credentials are wrong", async () => {
          const signInMutationVariables = {
            authCredentialsInput: {
              username,
              password: 'wrong-password',
            },
          };

          const { authCredentialsInput } = signInMutationVariables;

          await usersRepository.create({ username, password });

          await request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: `
                mutation SignIn($authCredentialsInput: AuthCredentialsInput!) {
                  signIn(authCredentialsInput: $authCredentialsInput) {
                    access_token
                  }
                }
              `,
              variables: {
                authCredentialsInput,
              },
            })
            .expect(HttpStatus.OK)
            .expect((response) => {
              expect(response.body.data).toBeNull();
              expect(response.body.errors[0].message).toBe('Unauthorized');
              expect(
                response.body.errors[0].extensions.originalError.statusCode,
              ).toBe(401);
            });
        });

        it("throws 'Unauthorized' error when user does not exist", async () => {
          const signInMutationVariables = {
            authCredentialsInput: {
              username: 'unexisting-user@x.com',
              password,
            },
          };

          await request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: `
                mutation SignIn($authCredentialsInput: AuthCredentialsInput!) {
                  signIn(authCredentialsInput: $authCredentialsInput) {
                    access_token
                  }
                }
              `,
              variables: signInMutationVariables,
            })
            .expect(HttpStatus.OK)
            .expect((response) => {
              expect(response.body.data).toBeNull();
              expect(response.body.errors[0].message).toBe('Unauthorized');
              expect(
                response.body.errors[0].extensions.originalError.statusCode,
              ).toBe(401);
            });
        });
      });
    });
  });
});
