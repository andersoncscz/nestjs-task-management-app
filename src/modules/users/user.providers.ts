import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { USER_REPOSITORY } from './user.constants';
import { DATA_SOURCE } from '../database/constants';
import { RepositoryProvider } from 'src/types/repository-provider.type';

const userRepositoryProvider: RepositoryProvider<User> = {
  provide: USER_REPOSITORY,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
  inject: [DATA_SOURCE],
};

export const userProviders: RepositoryProvider<User>[] = [
  userRepositoryProvider,
];
