import express from 'express';
import ValidationMiddleware from '../../middleware/validation.middleware';
import CustomerRatingController from '../../controller/customer/rating.controller';
import { verifyCustomerAccessToken } from '../../middleware/authGard.middleware';

const router = express.Router();

router.post(
  '/',
  verifyCustomerAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.CreateRatingCred),
  CustomerRatingController.createRating,
);

export default router;


