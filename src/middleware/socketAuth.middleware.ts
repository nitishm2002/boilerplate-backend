import { Socket } from 'socket.io';
import * as JwtUtils from '../lib/jwt.utils';
import RedisHelper from '../lib/redis.helper';

interface ITokenResponse {
  id: number;
  type: string;
  email: string;
}

export function verifySocketToken(
  socket: Socket,
  next: (err?: any) => void,
  allowedRoles?: string[],
) {
  try {
    const token = (socket.handshake?.headers?.auth as string) || socket.handshake?.auth?.token;
    if (!token) return next(new Error('Authentication error: No token provided'));

    JwtUtils.verifyTokenData(token)
      .then(async (response: any) => {
        const tokenData = response as ITokenResponse;

        // Role check
        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(tokenData.type)) {
            return next(new Error('Access denied. Invalid user role.'));
          }
        }

        // Session check in Redis
        const isMember = await RedisHelper.sIsMember(
          `${tokenData.type}:${tokenData.id}.token`,
          token,
        );
        if (!isMember) return next(new Error('Session expired'));

        socket.data.user = tokenData; // store user info
        next();
      })
      .catch((err: Error) => next(new Error('Authentication error: ' + err.message)));
  } catch (err) {
    next(new Error('Internal server error'));
  }
}
