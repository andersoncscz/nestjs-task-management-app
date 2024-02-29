import { DataSource, Repository } from 'typeorm';

export type RepositoryProvider<T> = {
  provide: string;
  useFactory: (dataSource: DataSource) => Repository<T>;
  inject: string[];
};
