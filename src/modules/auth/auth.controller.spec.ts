import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { userMock } from '../users/users.test-data';
import { AuthController } from './auth.controller';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { MyLogger } from '../logger/my-logger.service';
import { signInSucceeded } from './auth.test-data';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let logger: MyLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn().mockResolvedValue(null),
            signIn: jest.fn().mockResolvedValue(signInSucceeded),
          },
        },
        {
          provide: MyLogger,
          useValue: {
            verbose: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    logger = module.get<MyLogger>(MyLogger);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call the expected underlying services and create a verbose log', async () => {
      const { username, password } = userMock;
      const authCredentialsDto: AuthCredentialsDto = { username, password };

      await authController.signUp(authCredentialsDto);

      expect(logger.verbose).toHaveBeenCalledWith(
        `User "${userMock.username}" is signing up`,
      );

      expect(authService.signUp).toHaveBeenCalledWith(authCredentialsDto);
    });
  });

  describe('signIn', () => {
    it('should call the expected underlying services, create a verbose log and return the expected response', async () => {
      const response = await authController.signIn(userMock);

      expect(logger.verbose).toHaveBeenCalledWith(
        `User "${userMock.id}" is signing in`,
      );
      expect(authService.signIn).toHaveBeenCalledWith(userMock);
      expect(response).toBe(signInSucceeded);
    });
  });
});
