import express from 'express';
import ValidationMiddleware from '../../middleware/validation.middleware';
import ProfessionalRatingController from '../../controller/professional/rating.controller';
import { verifyProfessionalAccessToken } from '../../middleware/authGard.middleware';

const router = express.Router();

router.post(
  '/',
  verifyProfessionalAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.CreateRatingCred),
  ProfessionalRatingController.createRating,
);

export default router;


