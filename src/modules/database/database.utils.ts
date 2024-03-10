import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';
import { ConflictException } from '@nestjs/common';
import { dataSource } from '../database/database.config';

export const cleanupDatabase = async () => {
  if (process.env.NODE_ENV !== 'test') return;

  const entities = dataSource.entityMetadatas;
  const deleteEntitiesPromise = [];

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    deleteEntitiesPromise.push(repository.delete({}));
  }

  await Promise.all(deleteEntitiesPromise);
};

export const closeDatabaseConnection = async () => {
  await dataSource.destroy();
};

export const isQueryFailedError = (
  err: unknown,
): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError;

export class UserAlreadyExistsError extends ConflictException {
  constructor() {
    super('User already exists.');

    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);

    this.name = 'UserAlreadyExistsError';
  }
}

export function isUserAlreadyExistsError(error: unknown) {
  return isQueryFailedError(error) && error.code === '23505';
}
