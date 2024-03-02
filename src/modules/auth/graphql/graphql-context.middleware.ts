// graphql-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class GraphQLContextMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: () => void) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const user = this.jwtService.decode(token);
      req['user'] = user;
    }
    next();
  }
}
