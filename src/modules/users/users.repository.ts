import { Repository } from 'typeorm';
import { User } from './user.entity';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { USER_REPOSITORY } from './user.constants';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';
import { hashPassword } from '../auth/utils/auth.utils';
import {
  UserAlreadyExistsError,
  isUserAlreadyExistsError,
} from '../database/database.utils';
import { MyLogger } from '../logger/my-logger.service';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(USER_REPOSITORY)
    private repository: Repository<User>,
    private logger: MyLogger,
  ) {
    this.logger.setContext(UsersRepository.name);
  }

  async create(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;
    try {
      const hashedPassword = await hashPassword(password);

      const user = this.repository.create({
        username,
        password: hashedPassword,
      });

      return await this.repository.save(user);
    } catch (error) {
      if (isUserAlreadyExistsError(error)) {
        this.logger.error(`User "${username}" already exists`, error.stack);

        throw new UserAlreadyExistsError();
      }

      this.logger.error(`Failed to create user "${username}"`, error.stack);

      throw new InternalServerErrorException();
    }
  }

  async findByUsername(username: string): Promise<User> {
    return await this.repository.findOne({
      where: {
        username,
      },
    });
  }
}
