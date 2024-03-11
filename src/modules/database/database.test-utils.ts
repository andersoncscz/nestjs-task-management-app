import { DataSource } from 'typeorm';

export const cleanupDatabase = async (dataSource: DataSource) => {
  if (process.env.NODE_ENV !== 'test') return;

  const entities = dataSource.entityMetadatas;
  const deleteEntitiesPromise = [];

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    deleteEntitiesPromise.push(repository.delete({}));
  }

  await Promise.all(deleteEntitiesPromise);
};

export const closeDatabaseConnection = async (dataSource: DataSource) => {
  await dataSource.destroy();
};
