import { comparePassword, hashPassword } from './auth.utils';

describe('hashPassword', () => {
  it('should return a hashed password', async () => {
    const password = 'my-password';
    const hashedPassword = await hashPassword('my-password');

    expect(hashedPassword).toBeDefined();
    expect(password.length < hashedPassword.length).toBeTruthy();
    expect(password !== hashedPassword).toBeTruthy();
  });
});

describe('comparePassword', () => {
  it('should return true when password and hashedPassword match', async () => {
    const password = 'my-password';
    const hashedPassword = await hashPassword(password);
    const isGivenPasswordCorrect = await comparePassword(
      password,
      hashedPassword,
    );
    expect(isGivenPasswordCorrect).toBeTruthy();
  });

  it('should return false when password and hashedPassword do not match', async () => {
    const password = 'my-password';
    const wrongPassword = 'my-wrong-password';
    const hashedPassword = await hashPassword(password);
    const isGivenPasswordCorrect = await comparePassword(
      wrongPassword,
      hashedPassword,
    );

    expect(isGivenPasswordCorrect).toBeFalsy();
  });
});
