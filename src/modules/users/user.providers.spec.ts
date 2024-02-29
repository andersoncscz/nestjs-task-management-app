import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { USER_REPOSITORY } from './user.constants';
import { DATA_SOURCE } from '../database/constants';
import { userProviders } from './user.providers';

describe('User Providers', () => {
  const dataSource: DataSource = {} as any;
  const repository: Repository<User> = {} as any;

  dataSource.getRepository = jest.fn().mockReturnValue(repository);

  it('should provide userRepository', () => {
    const userRepositoryProvider = userProviders.find(
      (provider) => provider.provide === USER_REPOSITORY,
    );

    expect(userRepositoryProvider).toBeDefined();

    const userRepository = userRepositoryProvider.useFactory(dataSource);
    expect(userRepository).toBe(repository);
  });

  it('should inject DataSource into useFactory', () => {
    const userRepositoryProvider = userProviders.find(
      (provider) => provider.provide === USER_REPOSITORY,
    );

    expect(userRepositoryProvider).toBeDefined();

    userRepositoryProvider.useFactory(dataSource);
    expect(dataSource.getRepository).toHaveBeenCalledWith(User);
  });

  it('should inject DATA_SOURCE', () => {
    const userRepositoryProvider = userProviders.find(
      (provider) => provider.provide === USER_REPOSITORY,
    );

    expect(userRepositoryProvider).toBeDefined();

    if (userRepositoryProvider) {
      expect(userRepositoryProvider.inject).toContain(DATA_SOURCE);
    }
  });
});
