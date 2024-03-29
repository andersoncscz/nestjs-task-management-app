import * as bcrypt from 'bcrypt';
const saltOrRounds = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, saltOrRounds);
}

export async function verifyIfPasswordIsCorrect(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
