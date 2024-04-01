import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';
import { MyLogger } from '../logger/my-logger.service';
import { InternalServerErrorException } from '@nestjs/common';
import { USER_REPOSITORY } from './user.constants';
import { userMock } from './users.test-data';
import * as AuthUtilsModule from '../auth/utils/auth.utils';
import * as DatabaseUtilsModule from '../database/database.utils';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let repository: Repository<User>;
  let myLogger: MyLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: USER_REPOSITORY,
          useClass: Repository,
        },
        {
          provide: MyLogger,
          useValue: {
            setContext: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    repository = module.get<Repository<User>>(USER_REPOSITORY);
    myLogger = module.get<MyLogger>(MyLogger);
  });

  it('should be defined', () => {
    expect(usersRepository).toBeDefined();
  });

  it('should have dependencies defined', () => {
    expect(repository).toBeDefined();
    expect(myLogger).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: userMock.username,
        password: userMock.password,
      };

      jest.spyOn(repository, 'create').mockReturnValue(userMock);
      jest.spyOn(AuthUtilsModule, 'hashPassword');
      jest.spyOn(repository, 'save').mockResolvedValue(undefined);

      await usersRepository.create(authCredentialsDto);

      expect(AuthUtilsModule.hashPassword).toHaveBeenCalledWith(
        authCredentialsDto.password,
      );
      expect(repository.save).toHaveBeenCalledWith(userMock);
    });

    it('should throw UserAlreadyExistsError if user already exists', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: userMock.username,
        password: userMock.password,
      };

      jest
        .spyOn(DatabaseUtilsModule, 'isQueryFailedError')
        .mockReturnValue(true);
      jest.spyOn(repository, 'create').mockReturnValue(userMock);
      jest.spyOn(AuthUtilsModule, 'hashPassword');
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue({ code: '23505', stack: 'stacktrace' });

      const { UserAlreadyExistsError } = DatabaseUtilsModule;
      await expect(usersRepository.create(authCredentialsDto)).rejects.toThrow(
        UserAlreadyExistsError,
      );

      expect(AuthUtilsModule.hashPassword).toHaveBeenCalledWith(
        authCredentialsDto.password,
      );

      expect(repository.save).toHaveBeenCalledWith(userMock);

      expect(myLogger.error).toHaveBeenCalledWith(
        `User "${authCredentialsDto.username}" already exists`,
        'stacktrace',
      );
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: userMock.username,
        password: userMock.password,
      };

      jest
        .spyOn(DatabaseUtilsModule, 'isQueryFailedError')
        .mockReturnValue(true);
      jest.spyOn(repository, 'create').mockReturnValue(userMock);
      jest.spyOn(AuthUtilsModule, 'hashPassword');
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(usersRepository.create(authCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(AuthUtilsModule.hashPassword).toHaveBeenCalledWith(
        authCredentialsDto.password,
      );

      expect(repository.save).toHaveBeenCalledWith(userMock);

      expect(myLogger.error).toHaveBeenCalledWith(
        `Failed to create user "${authCredentialsDto.username}"`,
        expect.any(String),
      );
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(userMock);

      const result = await usersRepository.findByUsername(userMock.username);

      expect(result).toEqual<User>(userMock);
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await usersRepository.findByUsername('nonexistentuser');

      expect(result).toBeNull();
    });
  });
});
