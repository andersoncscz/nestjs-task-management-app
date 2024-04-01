import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UsersRepository } from './users.repository';
import { userMock } from './users.test-data';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';

describe('UserService', () => {
  let userService: UserService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UsersRepository,
          useValue: {
            findByUsername: jest.fn().mockResolvedValue(userMock),
            create: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findByUsername', () => {
    it("should call 'findByUsername' method from UsersRepository class", async () => {
      const userFound = await userService.findByUsername(userMock.username);

      expect(usersRepository.findByUsername).toHaveBeenCalledWith(
        userMock.username,
      );
      expect(userFound).toBe(userMock);
    });
  });

  describe('signUp', () => {
    it("should call 'create' method from UsersRepository class", async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: userMock.username,
        password: userMock.password,
      };

      await userService.signUp(authCredentialsDto);

      expect(userService).toBeDefined();
      expect(usersRepository.create).toHaveBeenCalledWith(authCredentialsDto);
    });
  });
});
