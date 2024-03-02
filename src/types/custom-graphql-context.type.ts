import { Request } from 'express';
import { User } from 'src/modules/users/user.entity';

export type CustomContext = {
  req: Request & {
    user: User;
  };
};
