import { SuccessMsg } from '../../lib/constants';
import { ISearch } from '../../lib/common.interface';
import { Notification } from '../../models/notification.model';

export default new (class NotificationService {
  async getAllNotifications(args: ISearch, userId: number) {
    const { page, limit } = args;
    const skip = (page - 1) * limit;

    const whereClause: any = { user_id: userId, is_deleted_user: false };

    const totalCount = await Notification.count({ where: whereClause });
    const totalPage = Math.ceil(totalCount / limit);

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      offset: skip,
      limit: limit,
    });

    return {
      message: SuccessMsg.NOTIFICATION.get,
      page: page,
      perPage: limit,
      totalCount: totalCount,
      totalPage: totalPage,
      notifications,
    };
  }

  async markAsRead(notificationId: string, userId: number) {
    await Notification.update(
      { is_read_user: true },
      {
        where: {
          id: notificationId,
          user_id: userId,
          is_deleted_user: false,
        },
      },
    );

    return {
      message: SuccessMsg.NOTIFICATION.markAsRead,
    };
  }

  async markAllAsRead(userId: number) {
    await Notification.update(
      { is_read_user: true },
      {
        where: {
          user_id: userId,
          is_deleted_user: false,
          is_read_user: false,
        },
      },
    );

    return {
      message: SuccessMsg.NOTIFICATION.markAsRead,
    };
  }

  async getUnreadCount(userId: number) {
    const count = await Notification.count({
      where: {
        user_id: userId,
        is_deleted_user: false,
        is_read_user: false,
      },
    });

    return {
      message: SuccessMsg.NOTIFICATION.unreadCount,
      count,
    };
  }

  async deleteAllNotifications(userId: number) {
    await Notification.update(
      { is_deleted_user: true },
      {
        where: {
          user_id: userId,
          is_deleted_user: false,
        },
      },
    );

    return {
      message: SuccessMsg.NOTIFICATION.delete,
    };
  }
})();
