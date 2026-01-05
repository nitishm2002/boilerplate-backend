import express from 'express';
import userRoutes from './common/auth.routes';
import jobCategoryRoutes from './common/jobCategory.route';
import customerJobRoutes from './customer/job.routes';
import professionalJobRoutes from './professional/job.routes';
import professionalDashboardRoutes from './professional/dashboard.routes';
import customerDashboardRoutes from './customer/dashboard.routes';
import customerRatingRoutes from './customer/rating.routes';
import professionalRatingRoutes from './professional/rating.routes';
import chatRoutes from './common/chat.routes';
import NotificationRoutes from './common/notification.routes';

const router = express.Router();

//Admin Routes
router.use('/user/auth', userRoutes);
router.use('/notification', NotificationRoutes);

// JobCategory Routes
router.use('/job-category', jobCategoryRoutes);

// Customer Job Routes
router.use('/customer/jobs', customerJobRoutes);

// Professional Job Routes
router.use('/professional/jobs', professionalJobRoutes);
router.use('/professional/dashboard', professionalDashboardRoutes);
router.use('/professional/ratings', professionalRatingRoutes);
// Rating Routes
router.use('/customer/ratings', customerRatingRoutes);
router.use('/customer/dashboard', customerDashboardRoutes);
router.use('/chats', chatRoutes);

// //Patient Routes

export default router;
