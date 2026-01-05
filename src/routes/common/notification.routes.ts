// notification.routes.ts
import { Router } from 'express';
import NotificationController from '../../controller/common/notification.controller';
import { verifyUserAccessToken } from '../../middleware/authGard.middleware';

const router = Router();

router.get('/', verifyUserAccessToken, NotificationController.getAllNotifications);
router.get('/unread-count', verifyUserAccessToken, NotificationController.getUnreadCount);
router.put('/read-all', verifyUserAccessToken, NotificationController.markAllAsRead);
router.put('/read/:notification_id', verifyUserAccessToken, NotificationController.markAsRead);
router.delete('/', verifyUserAccessToken, NotificationController.deleteAllNotifications);

export default router;
