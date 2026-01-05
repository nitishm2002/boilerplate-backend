import { Notification, INotification } from '../models/notification.model';
import logger from './logger';
import { getIO } from './socket.utils';

interface ICreateNotificationArgs {
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  type: string;
  chat_id?: string;
  job_id?: number;
}

export const sendNotificationToUser = async (
  args: ICreateNotificationArgs,
): Promise<INotification | null> => {
  try {
    const { user_id, title, message, notification_type, chat_id, job_id, type } = args;

    // Create notification record in DB
    const newNotificationData = await Notification.create({
      user_id,
      title,
      notification_type,
      message,
      chat_id: notification_type === 'chat' ? chat_id : null,
      job_id: notification_type !== 'chat' ? job_id : null,
      type: type,
    });
    const newNotification = newNotificationData.toJSON();

    // Prepare payload for Socket.IO
    const notificationData = {
      user_id: newNotification.user_id,
      title: newNotification.title,
      message: newNotification.message,
      notification_type: newNotification.notification_type,
      chat_id: newNotification.chat_id,
      job_id: newNotification.job_id,
    };

    const io = getIO();

    // Send via Socket.IO
    const namespace = io.of('/notifications'); // notifications namespace
    const room = `notification_user_${user_id}`;
    console.log('room: ', room);
    const unread_count = await Notification.count({
      where: { user_id: user_id, is_read_user: false },
    });

    namespace.to(room).emit('new_notification', {
      unread_count,
      title: title,
      message,
      data: notificationData,
    });

    return newNotification;
  } catch (error) {
    logger.error(`Error creating/sending notification for user ${args.user_id}`, error);
    return null;
  }
};
