import { DataSource } from 'typeorm';
import { DATA_SOURCE } from './constants';
import databaseConfig from './database.config';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dbConfig = databaseConfig();
      const dataSource = new DataSource({
        ...dbConfig,
        type: 'postgres',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      });

      return dataSource.initialize();
    },
  },
];
