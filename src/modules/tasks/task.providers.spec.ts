import { DataSource, Repository } from 'typeorm';
import { taskProviders } from './task.providers';
import { Task } from './task.entity';
import { TASK_REPOSITORY } from './task.constants';
import { DATA_SOURCE } from '../database/constants';

describe('Task providers', () => {
  const dataSource: DataSource = {} as any;
  const repository: Repository<Task> = {} as any;

  dataSource.getRepository = jest.fn().mockReturnValue(repository);

  it('should provide taskRepository', () => {
    const taskRepositoryProvider = taskProviders.find(
      (provider) => provider.provide === TASK_REPOSITORY,
    );

    expect(taskRepositoryProvider).toBeDefined();

    const taskRepository = taskRepositoryProvider.useFactory(dataSource);
    expect(taskRepository).toBe(repository);
  });

  it('should inject DataSource into useFactory', () => {
    const taskRepositoryProvider = taskProviders.find(
      (provider) => provider.provide === TASK_REPOSITORY,
    );

    expect(taskRepositoryProvider).toBeDefined();

    taskRepositoryProvider.useFactory(dataSource);
    expect(dataSource.getRepository).toHaveBeenCalledWith(Task);
  });

  it('should inject DATA_SOURCE', () => {
    const taskRepositoryProvider = taskProviders.find(
      (provider) => provider.provide === TASK_REPOSITORY,
    );

    expect(taskRepositoryProvider).toBeDefined();
    expect(taskRepositoryProvider.inject).toContain(DATA_SOURCE);
  });
});
