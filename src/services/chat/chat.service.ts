import { Op } from 'sequelize';
import * as Utils from '../../lib/utils';
import { Chat, ChatMessage, Job, JobLike, User } from '../../models';
import { getIO } from '../../lib/socket.utils';
import { UserType, ErrorMsg, SuccessMsg, NotificationTemplates } from '../../lib/constants';
import { ICreateChat, ISearch } from '../../lib/common.interface';
import { sendNotificationToUser } from '../../lib/notification.utils';

export default new (class ChatService {
  async fetchChats(args: ISearch, userId: number, type: string) {
    try {
      const { page, limit } = args;
      const skip = (page - 1) * limit;
      const isCustomer = type === UserType.TYPE.customer;

      const whereClause = {
        [Op.or]: [{ customer_id: userId }, { professional_id: userId }],
      };

      // 🔢 Total count
      const totalCount = await Chat.count({ where: whereClause });
      const totalPage = Math.ceil(totalCount / limit);

      // 📥 Fetch chats
      const chats = await Chat.findAll({
        where: whereClause,
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'job_id', 'status', 'progress_status'],
          },
          {
            model: User,
            as: isCustomer ? 'professional' : 'customer',
            attributes: ['id', 'name', 'profile_image', 'role', 'email'],
          },
        ],
        order: [['updated_at', 'DESC']],
        offset: skip,
        limit: limit,
        raw: true,
        nest: true,
      });
      const formattedChats = chats.map((chat: any) => {
        const data = chat;

        return {
          id: data.id,
          job: data.job,
          last_message: data.last_message,
          last_message_at: data.last_message_at,
          last_message_sender_id: data.last_message_sender_id,
          unread_count: isCustomer ? data.customer_unread_count : data.professional_unread_count,
          user: isCustomer ? data.professional : data.customer,
        };
      });

      return {
        message: SuccessMsg.CHAT.fetchChats,
        page: page,
        perPage: limit,
        totalCount: totalCount,
        totalPage: totalPage,
        chats: formattedChats,
      };
    } catch (err) {
      Utils.throwError(err as Error);
    }
  }

  async fetchMessages(chatId: string) {
    try {
      const messages = await ChatMessage.findAll({
        where: { chat_id: chatId },
        order: [['created_at', 'ASC']],
      });

      const chat = await Chat.findByPk(chatId, {
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'job_id', 'status'],
          },
        ],
      });

      return {
        message: SuccessMsg.CHAT.fetchMessages,
        messages,
        job: chat.job,
      };
    } catch (err) {
      Utils.throwError(err as Error);
    }
  }

  async createOrGetChat(body: ICreateChat, sender_id: number, type: string) {
    let chat;
    if (type === UserType.TYPE.customer) {
      chat = await Chat.findOne({
        where: {
          job_id: body.job_id,
          customer_id: sender_id,
          professional_id: body.receiver_id,
        },
      });
      if (!chat) {
        const existing_job = await JobLike.findOne({
          where: {
            job_id: body.job_id,
            professional_id: body.receiver_id,
          },
          raw: true,
        });
        if (!existing_job) {
          Utils.throwError(ErrorMsg.CHAT.notAuthorize);
        }
        chat = await Chat.create({
          job_id: body.job_id,
          customer_id: sender_id,
          professional_id: body.receiver_id,
        });
      }
    } else {
      chat = await Chat.findOne({
        where: {
          job_id: body.job_id,
          customer_id: body.receiver_id,
          professional_id: sender_id,
        },
      });
      const existing_job = await JobLike.findOne({
        where: {
          job_id: body.job_id,
          professional_id: sender_id,
        },
        raw: true,
      });
      if (!existing_job) {
        Utils.throwError(ErrorMsg.CHAT.notAuthorize);
      }
      if (!chat) {
        chat = await Chat.create({
          job_id: body.job_id,
          customer_id: body.receiver_id,
          professional_id: sender_id,
        });
      }
    }

    return {
      message: SuccessMsg.CHAT.createOrGet,
      chat,
    };
  }

  async addMessage(chatId: string, senderId: number, message: string) {
    // ✅ Fetch chat
    const chat = await Chat.findByPk(chatId, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'job_id'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'profile_image', 'role'],
        },
        {
          model: User,
          as: 'professional',
          attributes: ['id', 'name', 'profile_image', 'role'],
        },
      ],
    });
    if (!chat) {
      Utils.throwError(ErrorMsg.CHAT.notFound);
    }

    // ✅ Validate participant
    const isCustomer = senderId === chat.customer_id;
    const isProfessional = senderId === chat.professional_id;

    if (!isCustomer && !isProfessional) {
      Utils.throwError(ErrorMsg.CHAT.notParticipant);
    }

    const receiverId = isCustomer ? chat.professional_id : chat.customer_id;
    const sender = isCustomer ? chat.customer : chat.professional;

    const senderName = sender?.name || 'Someone';

    const notification = NotificationTemplates.NEW_CHAT(senderName, message);

    await sendNotificationToUser({
      user_id: receiverId,
      title: notification.title,
      message: notification.message,
      notification_type: notification.notification_type,
      chat_id: chatId,
      type: notification.type,
    });

    // ✅ Create message
    const newMessage = await ChatMessage.create({
      chat_id: chatId,
      sender_id: senderId,
      message,
      is_read: false,
    });

    // ✅ Prepare unread counters
    const chatUpdate: any = {
      last_message: message,
      last_message_at: new Date(),
      last_message_sender_id: senderId,
    };

    if (isCustomer) {
      chatUpdate.professional_unread_count = (chat.professional_unread_count || 0) + 1;
    } else {
      chatUpdate.customer_unread_count = (chat.customer_unread_count || 0) + 1;
    }

    // ✅ Update chat row (single write)
    await chat.update(chatUpdate);

    // ✅ Emit socket event
    try {
      const receiverId = senderId === chat.customer_id ? chat.professional_id : chat.customer_id;

      const senderUnreadCount = 0;
      const receiverUnreadCount =
        senderId === chat.customer_id ? chat.professional_unread_count : chat.customer_unread_count;
      const io = getIO();
      const chatNS = io.of('/chat');

      chatNS.to(`chat_${chatId}`).except(`user_${senderId}`).emit('new_message', {
        chatId,
        message: newMessage,
      });

      chatNS.to(`user_${receiverId}`).emit('chat_updated', {
        chatId,
        last_message: message,
        last_message_at: chat.last_message_at,
        last_message_sender_id: senderId,
        unread_count: receiverUnreadCount,
      });

      // 👉 Update SENDER chat list
      chatNS.to(`user_${senderId}`).emit('chat_updated', {
        chatId,
        last_message: message,
        last_message_at: chat.last_message_at,
        last_message_sender_id: senderId,
        unread_count: senderUnreadCount,
      });
    } catch (err) {
      console.error('Socket emission failed:', err);
    }

    return {
      message: SuccessMsg.CHAT.sendMessage,
      chatMessage: newMessage,
    };
  }

  async markRead(chatId: string, userId: number) {
    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      Utils.throwError(ErrorMsg.CHAT.notFound);
      return null;
    }

    if (userId !== chat.customer_id && userId !== chat.professional_id) {
      Utils.throwError(ErrorMsg.CHAT.notParticipant);
      return null;
    }

    const otherUserId = userId === chat.customer_id ? chat.professional_id : chat.customer_id;

    // ✅ Mark messages from OTHER user as read
    await ChatMessage.update(
      { is_read: true },
      {
        where: {
          chat_id: chatId,
          sender_id: otherUserId,
          is_read: false,
        },
      },
    );

    // ✅ Reset unread count
    if (userId === chat.customer_id) {
      await chat.update({ customer_unread_count: 0 });
    } else {
      await chat.update({ professional_unread_count: 0 });
    }

    return {
      message: SuccessMsg.CHAT.markRead,
      chatId,
      otherUserId,
    };
  }

  async getChatUserInfo(chatId: string, requestingUserId: number) {
    // Find chat
    const chat = await Chat.findOne({
      where: { id: chatId },
      include: [
        { model: User, as: 'customer' },
        { model: User, as: 'professional' },
      ],
      raw: true,
      nest: true,
    });

    if (!chat) {
      Utils.throwError('Chat not found');
    }

    // Determine the other user (not the requesting user)
    let otherUser;
    if (chat.customer.id === requestingUserId) {
      otherUser = chat.professional;
    } else if (chat.professional.id === requestingUserId) {
      otherUser = chat.customer;
    } else {
      Utils.throwError('Access denied to this chat');
    }

    return {
      id: otherUser.id,
      name: otherUser.name,
      avatar: otherUser.profile_image,
    };
  }
})();
