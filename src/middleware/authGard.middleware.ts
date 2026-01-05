import * as Utils from '../lib/utils';
import * as JwtUtils from '../lib/jwt.utils';
import { ErrorMsg, UserType } from '../lib/constants';
// import RedisHelper from '../lib/redis.helper';
import { Response, NextFunction } from 'express';
import { IRequest } from '../lib/common.interface';

interface TokenPayload {
  id: number;
  email: string;
  type: string;
}

function verifyAccessToken(allowedRoles?: string[]) {
  return (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const authToken = req.headers['authorization'];
      if (!authToken) {
        return res
          .status(Utils.statusCode.UNAUTHORIZED)
          .send(Utils.sendErrorResponse(Utils.getErrorMsg(ErrorMsg.USER.requireAuthToken)));
      }

      const bearer = authToken.split(' ');
      const bearerToken = bearer[1];

      JwtUtils.verifyTokenData(bearerToken)
        .then((response: any) => {
          const tokenData = response as TokenPayload;

          // Check role if allowedRoles is specified
          if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(tokenData.type)) {
              return res
                .status(Utils.statusCode.FORBIDDEN)
                .send(
                  Utils.sendErrorResponse(Utils.getErrorMsg('Access denied. Invalid user role.')),
                );
            }
          }

          req.user = tokenData as any;
          req.token = bearerToken;
          // RedisHelper.sIsMember(`${tokenData.type}:${tokenData.id}.token`, bearerToken)
          //   .then(() => {
          //     next();
          //   })
          //   .catch(() => {
          //     return res
          //       .status(Utils.statusCode.UNAUTHORIZED)
          //       .send(Utils.sendErrorResponse(Utils.getErrorMsg(ErrorMsg.USER.sessionExpire)));
          //   });
          next();
        })
        .catch((error: Error) => {
          return res
            .status(Utils.statusCode.UNAUTHORIZED)
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(error.message)));
        });
    } catch (e) {
      return res
        .status(Utils.statusCode.INTERNAL_SERVER_ERROR)
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(ErrorMsg.EXCEPTIONS.wentWrong)));
    }
  };
}

// Convenience functions for specific roles
function verifyCustomerAccessToken(req: IRequest, res: Response, next: NextFunction) {
  return verifyAccessToken([UserType.TYPE.customer])(req, res, next);
}

function verifyProfessionalAccessToken(req: IRequest, res: Response, next: NextFunction) {
  return verifyAccessToken([UserType.TYPE.professional])(req, res, next);
}

// Middleware that allows both customer and professional
function verifyUserAccessToken(req: IRequest, res: Response, next: NextFunction) {
  return verifyAccessToken([UserType.TYPE.customer, UserType.TYPE.professional])(req, res, next);
}

export {
  verifyAccessToken,
  verifyCustomerAccessToken,
  verifyProfessionalAccessToken,
  verifyUserAccessToken,
};
