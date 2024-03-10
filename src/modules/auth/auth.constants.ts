import { JwtSignOptions } from '@nestjs/jwt';

export const jwtSignOptions: JwtSignOptions = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
  expiresIn: '1d',
};

export const APP_GUARD = 'APP_GUARD';
