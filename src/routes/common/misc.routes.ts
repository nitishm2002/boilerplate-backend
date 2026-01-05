import { Router } from 'express';
import MiscController from '../../controller/common/misc.controller';
import validationMiddleware from '../../middleware/validation.middleware';

const router = Router();

// Get all chats for authenticated user

router.post(
  '/contact',
  validationMiddleware.validate(validationMiddleware.schema.CreateChat),
  MiscController.createInquiry,
);
export default router;
