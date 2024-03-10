import { DataSource } from 'typeorm';

const databaseConfig = () => {
  const config = {
    dev: {
      host: process.env.LOCAL_DEV_DATABASE_HOST,
      port: parseInt(process.env.LOCAL_DEV_DATABASE_PORT, 10) || 5432,
      username: process.env.LOCAL_DEV_DATABASE_USER_NAME,
      password: process.env.LOCAL_DEV_DATABASE_PASSWORD,
      database: process.env.LOCAL_DEV_DATABASE_NAME,
      synchronize: true,
    },
    test: {
      host: process.env.TEST_DATABASE_HOST,
      port: parseInt(process.env.TEST_DATABASE_PORT, 10) || 5432,
      username: process.env.TEST_DATABASE_USER_NAME,
      password: process.env.TEST_DATABASE_PASSWORD,
      database: process.env.TEST_DATABASE_NAME,
      synchronize: true,
      //dropSchema: true,
    },
    staging: {
      host: process.env.STAGING_DATABASE_HOST,
      port: parseInt(process.env.STAGING_DATABASE_PORT, 10) || 5432,
      username: process.env.STAGING_DATABASE_USER_NAME,
      password: process.env.STAGING_DATABASE_PASSWORD,
      database: process.env.STAGING_DATABASE_NAME,
    },
    prod: {
      host: process.env.PRODUCTION_DATABASE_HOST,
      port: parseInt(process.env.PRODUCTION_DATABASE_PORT, 10) || 5432,
      username: process.env.PRODUCTION_DATABASE_USER_NAME,
      password: process.env.PRODUCTION_DATABASE_PASSWORD,
      database: process.env.PRODUCTION_DATABASE_NAME,
    },
  };

  return config[process.env.NODE_ENV] || config.prod;
};

export const dataSource = new DataSource({
  ...databaseConfig(),
  type: 'postgres',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});
