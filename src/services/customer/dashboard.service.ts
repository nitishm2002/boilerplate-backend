import { Op, Sequelize } from 'sequelize';
import * as Utils from '../../lib/utils';
import { SuccessMsg, ErrorMsg } from '../../lib/constants';
import { Job, JobLike, JobBid, Chat } from '../../models/index';

export default new (class DashboardService {
  async dashboard(customerId: number) {
    const newJobsCount = await Job.count({
      where: {
        customer_id: customerId,
        status: 'open',
      },
    });

    const interestedCount = await JobLike.count({
      include: [
        {
          model: Job,
          as: 'job',
          required: true,
          where: {
            customer_id: customerId,
            status: 'open', // only open jobs
          },
        },
      ],
    });

    const chatCount = await Chat.count({
      where: {
        customer_id: customerId,
      },
      include: [
        {
          model: Job,
          as: 'job',
          required: true, // INNER JOIN
          where: {
            status: {
              [Op.notIn]: ['completed', 'cancelled'],
            },
          },
        },
      ],
    });

    return {
      message: SuccessMsg.JOB.get,
      counts: {
        newJobs: newJobsCount,
        interested: interestedCount,
        chat: chatCount,
      },
    };
  }
})();
