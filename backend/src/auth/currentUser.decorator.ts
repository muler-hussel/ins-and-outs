import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { addUserId2Req } from './auth.utils';

export const CurrentUserId = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<string | null> => {
    return await addUserId2Req(ctx);
  },
);
