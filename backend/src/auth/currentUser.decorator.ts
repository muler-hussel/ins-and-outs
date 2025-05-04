import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { addUserId2Req } from './auth.utils';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; sessionId: string };
}

interface GQLContext {
  req: AuthenticatedRequest;
}

export const CurrentUserId = createParamDecorator(
  async (data: unknown, context: ExecutionContext): Promise<string | null> => {
    let request: AuthenticatedRequest;
    if (context.getType().includes('graphql')) {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext<GQLContext>().req;
    } else {
      request = context.switchToHttp().getRequest();
    }
    return await addUserId2Req(request);
  },
);
