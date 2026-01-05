import { Op } from 'sequelize';
import * as Utils from '../../lib/utils';
import { SuccessMsg, ErrorMsg } from '../../lib/constants';
import { Job, JobLike, JobBid, Chat } from '../../models/index';

export default new (class DashboardService {
  async dashboard(professionalId: number) {
    // 1️⃣ New jobs count (jobs not liked yet)
    const likedJobIds = await JobLike.findAll({
      where: { professional_id: professionalId },
      attributes: ['job_id'],
    }).then((rows) => rows.map((r) => r.job_id));

    const newJobsCount = await Job.count({
      where: {
        id: { [Op.notIn]: likedJobIds.length ? likedJobIds : [0] },
        status: { [Op.ne]: 'completed' },
      },
    });

    // 2️⃣ Interested (submitted quote + job not completed + bid pending/accepted)
    const interestedCount = await JobLike.count({
      where: { professional_id: professionalId },
      include: [
        {
          model: Job,
          as: 'job',
          required: true,
          where: { status: { [Op.ne]: 'completed' } },
          include: [
            {
              model: JobBid,
              as: 'bids',
              required: false,
              where: {
                professional_id: professionalId,
                status: { [Op.in]: ['pending'] },
              },
            },
          ],
        },
      ],
    });

    // 3️⃣ Chat count
    const chatCount = await Chat.count({
      where: {
        professional_id: professionalId,
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
