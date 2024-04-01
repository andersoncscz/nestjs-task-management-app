import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MyLogger } from '../logger/my-logger.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { userMock } from '../users/users.test-data';
import * as AuthUtilsModule from './utils/auth.utils';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { FAKE_JWT } from './auth.test-data';
import { SignInSucceeded } from './types/sign-in-succeeded.type';
import { User } from '../users/user.entity';
import { jwtSignOptions } from './auth.constants';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: UserService,
          useValue: {
            signUp: jest.fn().mockResolvedValue(userMock),
            findByUsername: jest.fn().mockResolvedValue(userMock),
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

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should call the expected functions', async () => {
      const { username, password } = userMock;
      const authCredentialsDto: AuthCredentialsDto = { username, password };

      await authService.signUp(authCredentialsDto);

      expect(userService.signUp).toHaveBeenCalledWith(authCredentialsDto);
    });
  });

  describe('signIn', () => {
    it("should return a SignInSucceeded object with 'access_token' filled", async () => {
      jest
        .spyOn(jwtService, 'sign')
        .mockImplementation(jest.fn().mockReturnValue(FAKE_JWT));

      const payload: JwtPayload = {
        sub: userMock.id,
        username: userMock.username,
      };
      const result = await authService.signIn(userMock);
      const expectedResult: SignInSucceeded = { access_token: FAKE_JWT };

      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        secret: jwtSignOptions.secret,
      });
      expect(result).toEqual<SignInSucceeded>(expectedResult);
    });
  });

  describe('validateUser', () => {
    it('should return the user object when passwords match', async () => {
      jest
        .spyOn(AuthUtilsModule, 'verifyIfPasswordIsCorrect')
        .mockResolvedValue(true);

      const result = await authService.validateUser(
        userMock.username,
        'password',
      );

      expect(result).toEqual<User>(userMock);
      expect(userService.findByUsername).toHaveBeenCalledWith(
        userMock.username,
      );
      expect(AuthUtilsModule.verifyIfPasswordIsCorrect).toHaveBeenCalledWith(
        'password',
        userMock.password,
      );
    });

    it('should return null when passwords do not match', async () => {
      const result = await authService.validateUser(
        userMock.username,
        'wrong-password',
      );

      expect(result).toBeNull();
      expect(userService.findByUsername).toHaveBeenCalledWith(
        userMock.username,
      );
      expect(AuthUtilsModule.verifyIfPasswordIsCorrect).toHaveBeenCalledWith(
        'wrong-password',
        userMock.password,
      );
    });
  });
});
