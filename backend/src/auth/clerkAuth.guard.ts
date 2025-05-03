import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { addUserId2Req } from './auth.utils';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId = await addUserId2Req(context);
    return !!userId;
  }
}
