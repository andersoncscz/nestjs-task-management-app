import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { user } from '../users/users.test-data';
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

  it("should call 'signUp' from AuthService class and create a verbose log", () => {
    const { username, password } = user;
    const authCredentialsDto: AuthCredentialsDto = { username, password };

    authController.signUp(authCredentialsDto);

    expect(logger.verbose).toHaveBeenCalledWith(
      `User "${user.username}" is signing up`,
    );

    expect(authService.signUp).toHaveBeenCalledWith(authCredentialsDto);
  });

  it("should call 'signIn' from AuthService class, create a verbose log, and return a SignInSucceeded object", async () => {
    const response = await authController.signIn(user);

    expect(logger.verbose).toHaveBeenCalledWith(
      `User "${user.id}" is signing in`,
    );
    expect(authService.signIn).toHaveBeenCalledWith(user);
    expect(response).toBe(signInSucceeded);
  });
});
