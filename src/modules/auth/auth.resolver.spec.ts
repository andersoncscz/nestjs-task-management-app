import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { LocalStrategy } from './passport/local.strategy';
import { AuthService } from './auth.service';
import { MyLogger } from '../logger/my-logger.service';
import { signInSucceeded } from './auth.test-data';
import { user } from '../users/users.test-data';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let authService: AuthService;
  let logger: MyLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn().mockResolvedValue(null),
            signIn: jest.fn().mockResolvedValue(signInSucceeded),
            validateUser: jest.fn().mockResolvedValue(user),
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

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    logger = module.get<MyLogger>(MyLogger);
  });

  it('should be defined', () => {
    expect(authResolver).toBeDefined();
  });

  describe('signUp', () => {
    it('should call the expected underlying services and create a verbose log', async () => {
      const { username, password } = user;
      const authCredentialsDto: AuthCredentialsDto = { username, password };

      await authResolver.signUp(authCredentialsDto);

      expect(logger.verbose).toHaveBeenCalledWith(
        `User "${user.username}" is signing up`,
      );

      expect(authService.signUp).toHaveBeenCalledWith(authCredentialsDto);
    });
  });

  describe('signIn', () => {
    it('should call the expected underlying services, create a verbose log and return the expected response', async () => {
      const response = await authResolver.signIn(user);

      expect(logger.verbose).toHaveBeenCalledWith(
        `User "${user.id}" is signing in`,
      );
      expect(authService.signIn).toHaveBeenCalledWith(user);
      expect(response).toBe(signInSucceeded);
    });
  });
});
