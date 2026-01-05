import express from 'express';
import ValidationMiddleware from '../../middleware/validation.middleware';
import ProfessionalJobController from '../../controller/professional/job.controller';
import { verifyProfessionalAccessToken } from '../../middleware/authGard.middleware';

const router = express.Router();

// Get all open jobs with optional category filter
router.get('/', verifyProfessionalAccessToken, ProfessionalJobController.getOpenJobs);

// Like a job
router.post('/:id/like', verifyProfessionalAccessToken, ProfessionalJobController.likeJob);

// Submit a bid for a job
router.post(
  '/quote/:job_id',
  verifyProfessionalAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.SubmitBidCred),
  ProfessionalJobController.submitBid,
);
router.patch(
  '/quote/:job_id',
  verifyProfessionalAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.EditBidCred),
  ProfessionalJobController.editBid,
);

// View jobs they liked
router.get('/interested', verifyProfessionalAccessToken, ProfessionalJobController.getLikedJobs);

router.get(
  '/recent-transaction',
  verifyProfessionalAccessToken,
  ProfessionalJobController.getRecentTransactions,
);

// Get job by ID
router.get('/:job_id', verifyProfessionalAccessToken, ProfessionalJobController.getJobById);
router.patch(
  '/change-status/:job_id',
  verifyProfessionalAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.ChangeJobStatus),
  ProfessionalJobController.startOrCompleteJob,
);

export default router;
