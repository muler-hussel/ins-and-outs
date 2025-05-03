import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from '@clerk/backend';
import * as cookie from 'cookie';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; sessionId: string };
}

export async function addUserId2Req(
  ctx: ExecutionContext,
): Promise<string | null> {
  const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();

  const rawCookie = request.headers?.['cookie'] || '';
  let sessToken = '';
  if (rawCookie) {
    const cookies = cookie.parse(rawCookie);
    sessToken = cookies['__session'] || '';
  }

  const authHeader = request.headers?.['authorization'] || '';
  let bearerToken = '';
  if (authHeader && authHeader.startsWith('Bearer '))
    bearerToken = authHeader.split(' ')[1];

  if (!bearerToken && !sessToken) {
    return null;
  }
  const token = bearerToken || sessToken;

  const verifiedToken = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  if (!verifiedToken.sub) {
    return null;
  }

  const userId = verifiedToken.sub;
  const sessionId = verifiedToken.sid;
  // req['user'] = { userId, sessionId };//类型不安全
  request.user = { userId, sessionId };
  return request.user.userId;
}
