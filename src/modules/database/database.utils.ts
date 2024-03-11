import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';
import { ConflictException } from '@nestjs/common';

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
