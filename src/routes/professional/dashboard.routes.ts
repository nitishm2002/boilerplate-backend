import express from 'express';
import ValidationMiddleware from '../../middleware/validation.middleware';
import DashboardController from '../../controller/professional/dashboard.controller';
import {
  verifyCustomerAccessToken,
  verifyProfessionalAccessToken,
} from '../../middleware/authGard.middleware';
const router = express.Router();

router.get('/', verifyProfessionalAccessToken, DashboardController.Dashboard);

export default router;
