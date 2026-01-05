import { Op } from 'sequelize';
import * as Utils from '../../lib/utils';
import { SuccessMsg, ErrorMsg } from '../../lib/constants';
import { IJobCategory, JobCategory } from '../../models/jobCategory.model';
import { removeFileFromS3 } from '../../lib/aws.utils';
import AWSUtils from '../../config/aws.config';

interface CreateJobCategoryData {
  name: string;
  icon?: string;
}

interface UpdateJobCategoryData {
  name?: string;
  icon?: string;
}

export default new (class JobCategoryService {
  async createJob(args: CreateJobCategoryData) {
    const { name, icon } = args;

    // Check if job category already exists
    const existingCategory = await JobCategory.findOne({
      where: { name: { [Op.iLike]: name } },
    });

    if (existingCategory) {
      Utils.throwError(ErrorMsg.JOBCATEGORY.alreadyExists);
    }

    const newCategory = await JobCategory.create({
      name,
      icon: icon || null,
    });

    return {
      message: SuccessMsg.JOBCATEGORY.create,
      jobCategory: newCategory,
    };
  }

  async getAllJobCategory() {
    const categories = await JobCategory.findAll({
      order: [['created_at', 'DESC']],
    });

    return {
      message: SuccessMsg.JOBCATEGORY.get,
      jobCategories: categories,
    };
  }

  async getJobCategoryById(id: number) {
    const category = await JobCategory.findOne({
      where: { id },
    });

    if (!category) {
      Utils.throwError(ErrorMsg.JOBCATEGORY.notFound);
    }

    return {
      message: SuccessMsg.JOBCATEGORY.get,
      jobCategory: category,
    };
  }

  async updateJobCategory(id: number, args: UpdateJobCategoryData) {
    const category: IJobCategory | null = await JobCategory.findOne({
      where: { id },
    });

    if (!category) {
      Utils.throwError(ErrorMsg.JOBCATEGORY.notFound);
    }

    // Check if name is being updated and if it already exists
    if (args.name && args.name !== category.name) {
      const existingCategory = await JobCategory.findOne({
        where: {
          name: { [Op.iLike]: args.name },
          id: { [Op.ne]: id },
        },
      });

      if (existingCategory) {
        Utils.throwError(ErrorMsg.JOBCATEGORY.alreadyExists);
      }
    }

    // Update the category
    await JobCategory.update(args, { where: { id } });

    const updatedCategory: IJobCategory | null = await JobCategory.findOne({
      where: { id },
    });

    return {
      message: SuccessMsg.JOBCATEGORY.update,
      jobCategory: updatedCategory,
    };
  }

  async deleteJobCategory(id: number) {
    const category: IJobCategory | null = await JobCategory.findOne({
      where: { id },
    });

    if (!category) {
      Utils.throwError(ErrorMsg.JOBCATEGORY.notFound);
    }

    // Remove icon from S3 if it exists

    await JobCategory.destroy({ where: { id } });

    return {
      message: SuccessMsg.JOBCATEGORY.delete,
    };
  }
})();
