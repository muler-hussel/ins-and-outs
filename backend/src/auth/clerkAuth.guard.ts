import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { addUserId2Req } from './auth.utils';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; sessionId: string };
}

interface GQLContext {
  req: AuthenticatedRequest;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: AuthenticatedRequest = context.switchToHttp().getRequest();
    if (context.getType().includes('graphql')) {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext<GQLContext>().req;
    }
    const userId = await addUserId2Req(request);
    return !!userId;
  }
}
