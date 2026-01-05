import express from 'express';
import DashboardController from '../../controller/customer/dashboard.controller';
import { verifyCustomerAccessToken } from '../../middleware/authGard.middleware';

const router = express.Router();

router.get('/', verifyCustomerAccessToken, DashboardController.Dashboard);

export default router;
