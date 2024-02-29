import { RepositoryProvider } from 'src/types/repository-provider.type';
import { Task } from './task.entity';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../database/constants';
import { TASK_REPOSITORY } from './task.constants';

const taskRepositoryProvider: RepositoryProvider<Task> = {
  provide: TASK_REPOSITORY,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Task),
  inject: [DATA_SOURCE],
};

export const taskProviders: RepositoryProvider<Task>[] = [
  taskRepositoryProvider,
];
