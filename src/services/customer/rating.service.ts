import * as Utils from '../../lib/utils';
import { SuccessMsg, ErrorMsg } from '../../lib/constants';
import { Rating, AcceptedJob, User, Job } from '../../models/index';
import { RatingData } from '../../lib/common.interface';

export default new (class CustomerRatingService {
  async createRating(customerId: number, args: RatingData) {
    const { job_id, rating, role, professional_id } = args;

    const job = await Job.findOne({
      where: { id: job_id, customer_id: customerId, status: 'completed' },
    });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }
    const acceptedJob = await AcceptedJob.findOne({
      where: {
        job_id: job_id,
        customer_id: customerId,
        professional_id: professional_id,
      },
    });

    if (!acceptedJob) {
      Utils.throwError(ErrorMsg.RATING.acceptedJobNotFound);
    }

    const professionalId = professional_id;

    // Check if customer has already rated this job
    const existingRating = await Rating.findOne({
      where: {
        job_id: job_id,
        customer_id: customerId,
        rating_by: 'customer',
      },
    });

    if (existingRating) {
      Utils.throwError(ErrorMsg.RATING.alreadyExists);
    }

    // Create rating
    const newRating = await Rating.create({
      job_id,
      customer_id: customerId,
      professional_id: professionalId,
      rating_by: 'customer',
      rating,
    });

    // Update professional's rating summary
    const toUser = await User.findOne({ where: { id: professionalId } });

    if (toUser) {
      const oldAverage = toUser.average_rating || 0;
      const totalRatings = toUser.total_ratings || 0;

      const newAverage = (oldAverage * totalRatings + rating) / (totalRatings + 1);

      await User.update(
        {
          average_rating: newAverage,
          total_ratings: totalRatings + 1,
        },
        { where: { id: professionalId } },
      );
    }

    return {
      message: SuccessMsg.RATING.create,
    };
  }
})();

