import express from 'express';
import ValidationMiddleware from '../../middleware/validation.middleware';
import JobCategoryController from '../../controller/common/jobCategory.controller';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create JobCategory
router.post(
  '/',
  ValidationMiddleware.validate(ValidationMiddleware.schema.CreateJobCategoryCred),
  JobCategoryController.create,
);

// Get All JobCategories
router.get('/', JobCategoryController.getAll);

// Get JobCategory by ID
router.get('/:id', JobCategoryController.getById);

// Update JobCategory
router.patch(
  '/:id',
  ValidationMiddleware.validate(ValidationMiddleware.schema.UpdateJobCategoryCred),
  JobCategoryController.update,
);

// Delete JobCategory
router.delete('/:id', JobCategoryController.delete);

export default router;
