import { Response } from 'express';
import * as Utils from '../../lib/utils';
import chatService from '../../services/chat/chat.service';
import { ICreateChat, IRequest, ISearch } from '../../lib/common.interface';
import { Chat } from '../../models';
import paginationConfig from '../../config/pagination.config';
import { ErrorMsg } from '../../lib/constants';

export default new (class ChatController {
  getUserChats = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;
      const type = req.user.type;
      const args: ISearch = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || paginationConfig.PER_PAGE,
        search: (req.query.search as string) || '',
      };

      chatService
        .fetchChats(args, userId, type)
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

  getChatMessages = (req: IRequest, res: Response): void => {
    try {
      const chatId = req.params.chat_id;
      const userId = req.user.id;

      Chat.findByPk(chatId)
        .then((chat) => {
          if (!chat) {
            throw new Error('Chat not found');
          }

          if (userId !== chat.customer_id && userId !== chat.professional_id) {
            throw new Error('Access denied');
          }

          return chatService.fetchMessages(chatId);
        })
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

  createChat = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as ICreateChat;
      const sender_id = req.user.id;
      const type = req.user.type;

      chatService
        .createOrGetChat(body, sender_id, type)
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

  sendMessage = (req: IRequest, res: Response): void => {
    try {
      const chatId = req.body.chat_id;
      const { message } = req.body as { message: string };
      const senderId = req.user.id;

      if (!chatId) {
        Utils.throwError(ErrorMsg.CHAT.notFound);
      }

      chatService
        .addMessage(chatId, senderId, message)
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

  markMessagesRead = (req: IRequest, res: Response): void => {
    try {
      const chatId = req.params.chat_id;
      const userId = req.user.id;

      chatService
        .markRead(chatId, userId)
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

  getChatUserInfo = (req: IRequest, res: Response): void => {
    try {
      const chat_id = req.params.chat_id;

      chatService
        .getChatUserInfo(chat_id, req.user.id)
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
