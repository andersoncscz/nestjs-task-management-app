import { DATA_SOURCE } from './constants';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        type: 'postgres',
        synchronize: ['dev', 'test'].includes(process.env.NODE_ENV),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      });

      return await dataSource.initialize();
    },
  },
];
