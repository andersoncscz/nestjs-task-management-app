import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MyLogger } from '../logger/my-logger.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { user } from '../users/users.test-data';
import * as AuthUtilsModule from './utils/auth.utils';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { FAKE_JWT } from './auth.test-data';
import { SignInSucceeded } from './types/sign-in-succeeded.type';
import { User } from '../users/user.entity';

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
            signUp: jest.fn().mockResolvedValue(null),
            findByUsername: jest.fn().mockResolvedValue(user),
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
      const { username, password } = user;
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

      const payload: JwtPayload = { sub: user.id, username: user.username };
      const result = await authService.signIn(user);
      const expectedResult: SignInSucceeded = { access_token: FAKE_JWT };

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual<SignInSucceeded>(expectedResult);
    });
  });

  describe('validateUser', () => {
    it('should return the user object when passwords match', async () => {
      jest.spyOn(AuthUtilsModule, 'comparePassword').mockResolvedValue(true);

      const result = await authService.validateUser(user.username, 'password');

      expect(result).toEqual<User>(user);
      expect(userService.findByUsername).toHaveBeenCalledWith(user.username);
      expect(AuthUtilsModule.comparePassword).toHaveBeenCalledWith(
        'password',
        user.password,
      );
    });

    it('should return null when passwords do not match', async () => {
      const result = await authService.validateUser(
        user.username,
        'wrong-password',
      );

      expect(result).toBeNull();
      expect(userService.findByUsername).toHaveBeenCalledWith(user.username);
      expect(AuthUtilsModule.comparePassword).toHaveBeenCalledWith(
        'wrong-password',
        user.password,
      );
    });
  });
});
