import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACTIVE_KEY } from '../decorators/active.decorator';

@Injectable()
export class ActiveGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const active = this.reflector.getAllAndOverride<boolean>(ACTIVE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!active) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return user.active === active;
  }
}
