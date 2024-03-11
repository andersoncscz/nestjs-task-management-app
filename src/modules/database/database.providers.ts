import { DATA_SOURCE } from './constants';
import getDatabaseConfig from './database.config';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const { dataSource } = getDatabaseConfig();
      return await dataSource.initialize();
    },
  },
];
