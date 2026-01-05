import { Request, Response } from 'express';
import NotificationService from '../../services/common/notification.service';
import paginationConfig from '../../config/pagination.config';
import { IRequest, ISearch } from '../../lib/common.interface';
import * as Utils from '../../lib/utils';

export default new (class NotificationController {
  getAllNotifications = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;
      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
      };

      NotificationService.getAllNotifications(args, userId)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  markAsRead = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.notification_id;

      NotificationService.markAsRead(notificationId, userId)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  markAllAsRead = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;

      NotificationService.markAllAsRead(userId)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  getUnreadCount = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;

      NotificationService.getUnreadCount(userId)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  deleteAllNotifications = (req: IRequest, res: Response) => {
    try {
      const userId = req.user.id;

      NotificationService.deleteAllNotifications(userId)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };
})();
