import { DATA_SOURCE } from './constants';
import { dataSource } from './database.config';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      return await dataSource.initialize();
    },
  },
];
