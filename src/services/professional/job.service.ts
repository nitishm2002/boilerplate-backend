import { col, fn, Op, Sequelize, Transaction } from 'sequelize';
import * as Utils from '../../lib/utils';
import {
  SuccessMsg,
  ErrorMsg,
  JobProgressStatus,
  NotificationTemplates,
} from '../../lib/constants';
import { Job, JobLike, JobBid, User, JobCategory, AcceptedJob, Rating } from '../../models/index';
import { IChangeJobStatus, ISearch, SubmitBidData } from '../../lib/common.interface';
import { sequelize } from '../../connection/db.connection';
import { sendNotificationToUser } from '../../lib/notification.utils';
import logger from '../../lib/logger';
import { sendJobCompletedEmail, sendQuoteReceivedEmail } from '../../utils/sendEmail';

export default new (class ProfessionalJobService {
  async getOpenJobs(args: ISearch, professionalId: number, categoryId?: number) {
    const { page, limit, search } = args;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: 'open',
    };
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const likedJobs = await JobLike.findAll({
      where: { professional_id: professionalId },
      attributes: ['job_id'],
      raw: true,
    });
    const likedJobIds = likedJobs.map((like: any) => like.job_id);

    // Exclude jobs that professional has already liked
    if (likedJobIds.length > 0) {
      whereClause.id = { [Op.notIn]: likedJobIds };
    }

    if (categoryId) {
      whereClause.category_id = categoryId;
    }
    const totalCount = await Job.count({ where: whereClause });
    const totalPage = Math.ceil(totalCount / limit);

    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      offset: skip,
      limit: limit,
    });

    return {
      message: SuccessMsg.JOB.get,
      page: page,
      perPage: limit,
      totalCount: totalCount,
      totalPage: totalPage,
      jobs: jobs,
    };
  }

  async likeJob(professionalId: number, jobId: number) {
    // Verify job exists
    const job = await Job.findOne({
      where: { id: jobId },
      raw: true,
    });

    const user = await User.findOne({ where: { id: professionalId }, raw: true });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    // Check if job is deleted (status = cancelled)
    if (job.status === 'cancelled') {
      Utils.throwError(ErrorMsg.JOB.deleted);
    }
    if (job.status === 'completed') {
      Utils.throwError(ErrorMsg.JOB.alreadyCompleted);
    }

    // Check if already liked
    const existingLike = await JobLike.findOne({
      where: { job_id: jobId, professional_id: professionalId },
    });

    if (!existingLike) {
      await JobLike.create({
        job_id: jobId,
        professional_id: professionalId,
      });
    }
    const notification = NotificationTemplates.PRO_INTERESTED(user.name, job.title);

    sendNotificationToUser({
      user_id: job.customer_id,
      title: notification.title,
      message: notification.message,
      notification_type: notification.notification_type,
      type: notification.type,
      job_id: job.id,
    }).catch((err) => logger.error('Notification error:', err));

    return {
      success: true,
      message: SuccessMsg.JOB.like,
    };
  }

  async submitBid(professionalId: number, args: SubmitBidData) {
    const { job_id, amount, message, currency } = args;

    // Verify job exists
    const job = await Job.findOne({
      where: { id: job_id },
    });

    const user = await User.findOne({ where: { id: professionalId }, raw: true });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    // Check if job is deleted (status = cancelled)
    if (job.status === 'cancelled') {
      Utils.throwError(ErrorMsg.JOB.deleted);
    }

    if (job.status === 'completed' || job.status === 'in_progress') {
      Utils.throwError(ErrorMsg.JOB.alreadyCompleted);
    }

    // Check if professional already submitted a bid for this job
    const existingBid = await JobBid.findOne({
      where: { job_id, professional_id: professionalId },
    });

    if (existingBid) {
      Utils.throwError('You have already submitted a bid for this job');
    }

    // Create bid
    const newBid = await JobBid.create({
      job_id,
      professional_id: professionalId,
      amount,
      message,
      currency,
      status: 'pending',
    });

    await JobLike.update(
      { is_bid_submitted: true },
      { where: { job_id: job_id, professional_id: professionalId } },
    );

    const bidWithRelations = await JobBid.findOne({
      where: { id: newBid.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
            { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
          ],
        },
        { model: User, as: 'professional', attributes: ['id', 'name', 'email', 'profile_image'] },
      ],
    });

    const notification = NotificationTemplates.QUOTE_RECEIVED(user.name, job.title);

    await sendNotificationToUser({
      user_id: job.customer_id,
      title: notification.title,
      message: notification.message,
      notification_type: notification.notification_type,
      type: notification.type,
      job_id: job.id,
    });

    await sendQuoteReceivedEmail({
      professionalName: user?.name,
      professionalEmail: user?.email,
      jobTitle: job?.title,
      jobId: job?.id,
      quoteAmount: amount,
      currency: currency,
      email: (bidWithRelations as any)?.job?.customer?.email,
    });

    return {
      message: SuccessMsg.JOB.bid,
      bid: bidWithRelations,
    };
  }

  async editBid(professionalId: number, args: SubmitBidData) {
    const { job_id, amount, message, currency } = args;

    // Verify job exists
    const job = await Job.findOne({
      where: { id: job_id },
    });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    // Job cancelled
    if (job.status === 'cancelled') {
      Utils.throwError(ErrorMsg.JOB.deleted);
    }

    // Job completed or in progress
    if (job.status === 'completed' || job.status === 'in_progress') {
      Utils.throwError(ErrorMsg.JOB.alreadyCompleted);
    }

    // Check if user already submitted a bid
    const existingBid = await JobBid.findOne({
      where: { job_id, professional_id: professionalId },
    });

    if (!existingBid) {
      Utils.throwError('No existing bid found to update');
    }

    // Check customer acceptance using AcceptedJob table
    const accepted = await AcceptedJob.findOne({
      where: { job_id },
    });

    if (accepted) {
      Utils.throwError('Customer has already accepted a bid. Editing is not allowed.');
    }

    // Only allow editing if bid is still pending
    if (existingBid.status !== 'pending') {
      Utils.throwError('Only pending bids can be edited');
    }

    // Update the bid
    await existingBid.update({
      amount,
      message,
      currency,
    });

    // Fetch updated with relations
    const updatedBid = await JobBid.findOne({
      where: { id: existingBid.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
            { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
          ],
        },
        {
          model: User,
          as: 'professional',
          attributes: ['id', 'name', 'email', 'profile_image'],
        },
      ],
    });

    return {
      message: 'Bid updated successfully',
      bid: updatedBid,
    };
  }

  async getLikedJobs(args: ISearch, professionalId: number) {
    const { page, limit, search, interested, submitted, won } = args;

    const skip = (page - 1) * limit;

    const jobInclude = [
      { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
      { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'profile_image'] },
      {
        model: JobBid,
        as: 'bids',
        attributes: [
          'id',
          'professional_id',
          'amount',
          'message',
          'currency',
          'status',
          'created_at',
        ],
        where: { professional_id: professionalId },
        required: false,
      },
      {
        model: Rating,
        as: 'ratings',
        attributes: ['id', 'rating', 'created_at'],
        where: {
          professional_id: professionalId,
          rating_by: 'professional',
        },
        required: false,
      },
    ];

    const jobWhere: any = { status: { [Op.ne]: 'cancelled' } };

    let likes: any[] = [];

    // -------------------------------------------
    // 🔥 Updated logic for interested filter
    // -------------------------------------------
    if (interested) {
      likes = await JobLike.findAll({
        where: {
          professional_id: professionalId,
          is_bid_submitted: false,
        },
        include: [
          {
            model: Job,
            as: 'job',
            where: jobWhere,
            required: true,
            include: jobInclude,
          },
          { model: User, as: 'professional', attributes: ['id', 'name', 'email'] },
        ],
        order: [['created_at', 'DESC']],
      });
    }
    // -------------------------------------------
    // 🔥 Original logic for submitted filter
    // -------------------------------------------
    else if (submitted) {
      likes = await JobLike.findAll({
        where: {
          professional_id: professionalId,
          is_bid_submitted: true, // submitted means bid exists
        },
        include: [
          {
            model: Job,
            as: 'job',
            where: { status: { [Op.notIn]: ['cancelled', 'completed', 'in_progress'] } },
            required: true,
            include: jobInclude,
          },
          { model: User, as: 'professional', attributes: ['id', 'name', 'email'] },
        ],
        order: [['created_at', 'DESC']],
      });
    } else if (won) {
      likes = await AcceptedJob.findAll({
        where: {
          professional_id: professionalId,
        },
        include: [
          {
            model: Job,
            as: 'job',
            where: jobWhere,
            required: true,
            include: jobInclude,
          },
          { model: User, as: 'professional', attributes: ['id', 'name', 'email'] },
        ],
        order: [['created_at', 'DESC']],
      });
    }

    // Pagination
    const totalCount = likes.length;
    const totalPage = Math.ceil(totalCount / limit);
    const paginatedLikes = likes.slice(skip, skip + limit);

    return {
      message: SuccessMsg.JOB.get,
      page,
      perPage: limit,
      totalCount,
      totalPage,
      likes: paginatedLikes,
    };
  }

  async getJobById(professionalId: number, jobId: number) {
    // Verify job exists
    const job = await Job.findOne({
      where: { id: jobId },
      include: [
        { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'profile_image'] },
      ],
      raw: true,
      nest: true,
    });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }
    const bids = await JobBid.findOne({
      where: { job_id: jobId, professional_id: professionalId },
      order: [['created_at', 'DESC']],
    });
    const likeJob = await JobLike.findOne({
      where: { job_id: jobId, professional_id: professionalId },
    });
    job.bids = bids;
    job.liked = likeJob ? true : false;

    const rating = await Rating.findOne({
      where: { job_id: jobId, professional_id: professionalId, rating_by: 'professional' },
    });

    job.is_rating_submitted = false;
    job.rating = null;
    if (rating) {
      job.is_rating_submitted = true;
      job.rating = rating.rating;
    }

    return {
      message: SuccessMsg.JOB.get,
      job: job,
    };
  }

  async getRecentTransactions(args: ISearch, professionalId: number) {
    const { page, limit } = args;
    const skip = (page - 1) * limit;

    const acceptedJobs = await AcceptedJob.findAll({
      where: { professional_id: professionalId },
      order: [['created_at', 'DESC']],
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title', 'description', 'status'] },
        { model: JobBid, as: 'bid' },
      ],
      raw: true,
      nest: true,
      limit: limit,
      offset: skip,
    });

    const totalCount = await AcceptedJob.count({ where: { professional_id: professionalId } });

    const jobCompleted = await AcceptedJob.count({
      where: { professional_id: professionalId },
      include: [
        {
          model: Job,
          required: true,
          as: 'job',
          attributes: ['id', 'title', 'description', 'status'],
          where: { status: 'completed' },
        },
      ],
    });

    const pendingEarningsResult = await AcceptedJob.findOne({
      where: { professional_id: professionalId },
      attributes: [[fn('COALESCE', fn('SUM', col('bid.amount')), 0), 'pendingEarnings']],
      include: [
        {
          model: Job,
          as: 'job',
          required: true,
          where: { status: 'in_progress' },
          attributes: [],
        },
        {
          model: JobBid,
          as: 'bid',
          required: true,
          attributes: [],
        },
      ],
      raw: true,
    });

    // 🔹 Completed earnings (job status = completed)
    const completedEarningsResult = await AcceptedJob.findOne({
      where: { professional_id: professionalId },
      attributes: [[fn('COALESCE', fn('SUM', col('bid.amount')), 0), 'completedEarnings']],
      include: [
        {
          model: Job,
          as: 'job',
          required: true,
          where: { status: 'completed' },
          attributes: [],
        },
        {
          model: JobBid,
          as: 'bid',
          required: true,
          attributes: [],
        },
      ],
      raw: true,
    });

    const totalPage = Math.ceil(totalCount / limit);

    return {
      message: 'Recent transactions fetched successfully',
      page: page,
      perPage: limit,
      totalCount: totalCount,
      totalPage: totalPage,
      totalCompletedJobs: jobCompleted,
      pendingEarnings: Number(pendingEarningsResult?.pendingEarnings || 0),
      completedEarnings: Number(completedEarningsResult?.completedEarnings || 0),
      transactions: acceptedJobs,
    };
  }

  async startOrCompleteJob(professional_id: number, jobId: number, body: IChangeJobStatus) {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // 1️⃣ Validate accepted job exists
      const acceptedJob = await AcceptedJob.findOne({
        where: { job_id: jobId, professional_id },
        include: [
          {
            model: Job,
            as: 'job',
            attributes: [
              'id',
              'customer_id',
              'job_id',
              'status',
              'title',
              'description',
              'is_job_started',
              'is_job_completed',
              'progress_status',
              'location',
            ],
          },
          {
            model: JobBid,
            as: 'bid',
            attributes: ['id', 'job_id', 'amount', 'currency'],
          },
        ],
        transaction,
      });

      if (!acceptedJob) {
        Utils.throwError(ErrorMsg.JOB.notFound);
      }

      const job = (acceptedJob as any).job;
      const job_bids = (acceptedJob as any).bid;

      if (job.status !== 'in_progress') {
        Utils.throwError(ErrorMsg.JOB.cannotStartJob);
      }

      const professional = await User.findOne({
        where: { id: professional_id },
        attributes: ['name', 'email'],
        raw: true,
      });
      const professionalName = professional?.name;

      // 3️⃣ Handle actions
      if (body.action === 'start') {
        if (job.is_job_started) {
          Utils.throwError(ErrorMsg.JOB.alreadyStarted);
        }

        await Job.update(
          { is_job_started: true, progress_status: JobProgressStatus.STATUS.CHECK_IN },
          { where: { id: jobId }, transaction },
        );

        const notification = NotificationTemplates.JOB_STARTED(professionalName, job.title);
        void sendNotificationToUser({
          user_id: job.customer_id,
          title: notification.title,
          message: notification.message,
          notification_type: notification.notification_type,
          type: notification.type,
          job_id: job.id,
        });

        await transaction.commit();
        return { message: SuccessMsg.JOB.startJob };
      }

      if (body.action === 'complete') {
        if (!job.is_job_started) {
          Utils.throwError(ErrorMsg.JOB.cannotCompleteJob);
        }
        if (job.is_job_completed) {
          Utils.throwError(ErrorMsg.JOB.alreadyCompleted);
        }

        await Job.update(
          { is_job_completed: true, progress_status: JobProgressStatus.STATUS.JOB_COMPLETED },
          { where: { id: jobId }, transaction },
        );

        const notification = NotificationTemplates.JOB_COMPLETED_BY_PROFESSIONAL(
          professionalName,
          job.title,
        );
        void sendNotificationToUser({
          user_id: job.customer_id,
          title: notification.title,
          message: notification.message,
          notification_type: notification.notification_type,
          type: notification.type,
          job_id: job.id,
        });

        await transaction.commit();
        const customer = await User.findOne({
          where: { id: job.customer_id },
          attributes: ['name', 'email'],
          raw: true,
        });
        if (customer?.email) {
          sendJobCompletedEmail({
            email: customer.email,
            customerName: customer.name,
            professionalName: professionalName,
            jobTitle: job.title,
            jobId: job.job_id,
            jobLocation: job.location,
            currency: job_bids.currency,
            quoteAmount: job_bids.amount,
          });
        }
        return { message: SuccessMsg.JOB.complete };
      }
    } catch (error: any) {
      await transaction.rollback();
      throw error;
    }
  }
})();
