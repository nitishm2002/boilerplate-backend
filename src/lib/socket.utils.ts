import { Server } from 'socket.io';
import chatService from '../services/chat/chat.service';
import { verifySocketToken } from '../middleware/socketAuth.middleware';
import logger from './logger';

let io: Server | null = null;

export const initSocket = (server: any): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  logger.info('Socket.IO server initialized.');

  const chat = io.of('/chat');
  const notification = io.of('/notifications');

  // Authenticate socket connections
  chat.use((socket, next) =>
    verifySocketToken(socket as any, next as any, ['customer', 'professional']),
  );

  chat.on('connection', (socket) => {
    const userId = (socket.data as any).user.id;

    socket.join(`user_${userId}`);

    // Join a specific chat room
    socket.on('join_chat', (payload: { chat_id: string }) => {
      const room = `chat_${payload.chat_id}`;
      socket.join(room);
      console.log('joined room', room);
      chat.to(room).emit('user_online', { userId });
    });

    // Leave a specific chat room
    socket.on('leave_chat', (payload: { chatId: string }) => {
      const room = `chat_${payload.chatId}`;
      socket.leave(room);
    });

    socket.on('mark_as_read', async ({ chatId }) => {
      const result = await chatService.markRead(chatId, userId);

      if (!result) return;

      const { otherUserId } = result;

      // 🔔 Notify sender that messages were read
      chat.to(`user_${otherUserId}`).emit('messages_read', {
        chatId,
        readerId: userId,
      });
    });
  });

  /* ---------------- NOTIFICATION NAMESPACE ---------------- */

  notification.use((socket, next) =>
    verifySocketToken(socket as any, next as any, ['customer', 'professional']),
  );

  notification.on('connection', (socket) => {
    const userId = (socket.data as any).user.id;

    socket.join(`notification_user_${userId}`);
    console.log('User Joined', socket.id, userId);

    socket.on('disconnect', () => {
      // no-op
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;
};
