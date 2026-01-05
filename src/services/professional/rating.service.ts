import * as Utils from '../../lib/utils';
import { SuccessMsg, ErrorMsg } from '../../lib/constants';
import { Rating, AcceptedJob, User, Job } from '../../models/index';
import { RatingData } from '../../lib/common.interface';

export default new (class ProfessionalRatingService {
  async createRating(professionalId: number, args: RatingData) {
    const { job_id, rating, role } = args;

    // Validate that role is 'professional'
    if (role !== 'professional') {
      Utils.throwError(ErrorMsg.RATING.invalidRole);
    }

    // Validate accepted_job_id exists
    const job = await Job.findOne({
      where: { id: job_id, status: 'completed' },
    });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    const acceptedJob = await AcceptedJob.findOne({
      where: {
        job_id: job_id,
        professional_id: professionalId,
      },
    });

    if (!acceptedJob) {
      Utils.throwError(ErrorMsg.RATING.acceptedJobNotFound);
    }

    // Check if professional has already rated this accepted job
    const existingRating = await Rating.findOne({
      where: {
        job_id: job_id,
        professional_id: professionalId,
        rating_by: 'professional',
      },
    });

    if (existingRating) {
      Utils.throwError(ErrorMsg.RATING.alreadyExists);
    }

    // Create rating
    const newRating = await Rating.create({
      job_id,
      customer_id: job.customer_id,
      professional_id: professionalId,
      rating_by: 'professional',
      rating,
    });

    // Update to_user's average_rating and total_ratings
    const user = await User.findOne({ where: { id: job.customer_id } });
    if (user) {
      const oldAverage = user.average_rating || 0;
      const totalRatings = user.total_ratings || 0;
      const newAverage = (oldAverage * totalRatings + rating) / (totalRatings + 1);

      await User.update(
        {
          average_rating: newAverage,
          total_ratings: totalRatings + 1,
        },
        { where: { id: job.customer_id } },
      );
    }

    return {
      message: SuccessMsg.RATING.create,
    };
  }
})();
