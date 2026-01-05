import express from 'express';
import ValidationMiddleware from '../../middleware/validation.middleware';
import CustomerJobController from '../../controller/customer/job.controller';
import { verifyCustomerAccessToken } from '../../middleware/authGard.middleware';
import multer from 'multer';
import { jobImagesUpload } from '../../lib/fileUpload.utils';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a job (with multiple images)
router.post(
  '/',
  verifyCustomerAccessToken,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  jobImagesUpload,
  ValidationMiddleware.validate(ValidationMiddleware.schema.CreateJobCred),
  CustomerJobController.createJob,
);

// Delete a job
router.delete('/:id', verifyCustomerAccessToken, CustomerJobController.deleteJob);

// Get all jobs posted by the customer
router.get('/', verifyCustomerAccessToken, CustomerJobController.getCustomerJobs);

// Most specific routes first
router.get(
  '/interested-professionals',
  verifyCustomerAccessToken,
  CustomerJobController.getJobProfessionals,
);

// Get professionals by job category
router.get(
  '/:job_id/professionals',
  verifyCustomerAccessToken,
  CustomerJobController.getProfessionalsByCategory,
);

// Get job professional detail (job by job_id and professional_id)
router.get(
  '/:job_id/professionals/:professional_id',
  verifyCustomerAccessToken,
  CustomerJobController.getJobProfessionalDetail,
);

// Get job by ID
router.get('/:job_id', verifyCustomerAccessToken, CustomerJobController.getJobById);

// Accept a bid
router.patch(
  '/:job_id/bids',
  verifyCustomerAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.AcceptBidCred),
  CustomerJobController.acceptBid,
);

// Mark job as completed
router.patch(
  '/:job_id/complete',
  verifyCustomerAccessToken,
  CustomerJobController.markJobAsCompleted,
);

// Swipe API (left swipe creates JobLike)
router.post(
  '/swipe',
  verifyCustomerAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.SwipeCred),
  CustomerJobController.swipeProfessional,
);

export default router;
