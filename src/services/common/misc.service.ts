import { Op } from 'sequelize';
import * as Utils from '../../lib/utils';
import { SuccessMsg, ErrorMsg } from '../../lib/constants';
import { IJobCategory, JobCategory } from '../../models/jobCategory.model';
import { removeFileFromS3 } from '../../lib/aws.utils';
import AWSUtils from '../../config/aws.config';
import { EarlyAccess } from '../../models/earlyAccess.model';
import { sendEarlyAccessConfirmationTemplate } from '../../utils/sendEmail';

export default new (class JobCategoryService {
  async createJob(args: Record<string, string>) {
    const { email, text } = args;

    const newUser = await EarlyAccess.create({
      email,
      text,
    });

    await sendEarlyAccessConfirmationTemplate(newUser);

    return {
      message: SuccessMsg.INQUIRY.send,
      user: newUser,
    };
  }
})();
