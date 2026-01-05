import { Router } from 'express';
import ChatController from '../../controller/chat/chat.controller';
import { verifyUserAccessToken } from '../../middleware/authGard.middleware';
import validationMiddleware from '../../middleware/validation.middleware';

const router = Router();

// Get all chats for authenticated user
router.get('/:chat_id/messages', verifyUserAccessToken, ChatController.getChatMessages);
router.get('/', verifyUserAccessToken, ChatController.getUserChats);

// Create or get chat for a job between customer and professional
router.post(
  '/',
  verifyUserAccessToken,
  validationMiddleware.validate(validationMiddleware.schema.CreateChat),
  ChatController.createChat,
);

router.post(
  '/send-message',
  verifyUserAccessToken,
  validationMiddleware.validate(validationMiddleware.schema.SendMessage),
  ChatController.sendMessage,
);

// Mark messages as read in a chat
router.patch('/:chat_id/mark-as-read', verifyUserAccessToken, ChatController.markMessagesRead);
// Get user info for a chat (to show in chat header)
router.get('/:chat_id/user-info', verifyUserAccessToken, ChatController.getChatUserInfo);

export default router;
