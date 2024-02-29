import { QueryFailedError } from 'typeorm';
import * as DatabaseUtilsModule from './database.utils';

describe('isQueryFailedError', () => {
  it('should return true if the given error is an instace of QUeryFailedError', () => {
    expect(
      DatabaseUtilsModule.isQueryFailedError(
        new QueryFailedError('', [], new Error()),
      ),
    ).toBeTruthy();
  });

  it('should return false if the given error is not an instace of QueryFailedError', () => {
    expect(DatabaseUtilsModule.isQueryFailedError(new Error())).toBeFalsy();
  });
});

describe('isUserAlreadyExistsError', () => {
  it("should return true if the given error is an instace of QueryFailedError and code is '23505'", () => {
    jest.spyOn(DatabaseUtilsModule, 'isQueryFailedError').mockReturnValue(true);
    expect(
      DatabaseUtilsModule.isUserAlreadyExistsError({ code: '23505' }),
    ).toBeTruthy();
  });

  it("should return false if the given error is an instace of QueryFailedError but code is not '23505'", () => {
    jest.spyOn(DatabaseUtilsModule, 'isQueryFailedError').mockReturnValue(true);
    expect(
      DatabaseUtilsModule.isUserAlreadyExistsError({ code: '12345' }),
    ).toBeFalsy();
  });

  it('should return false if the given error is not an instace of QueryFailedError', () => {
    jest
      .spyOn(DatabaseUtilsModule, 'isQueryFailedError')
      .mockReturnValue(false);
    expect(
      DatabaseUtilsModule.isUserAlreadyExistsError({ code: '23505' }),
    ).toBeFalsy();
  });
});
