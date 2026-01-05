import { Op, QueryTypes } from 'sequelize';
import * as Utils from '../../lib/utils';
import {
  SuccessMsg,
  ErrorMsg,
  JobProgressStatus,
  NotificationTemplates,
} from '../../lib/constants';
import {
  Job,
  IJob,
  JobLike,
  JobBid,
  IJobBid,
  AcceptedJob,
  User,
  JobCategory,
  IAcceptedJob,
  IJobLike,
  Rating,
} from '../../models/index';
import { CreateJobData, ISearch, SwipeData } from '../../lib/common.interface';
import { removeFileFromS3 } from '../../lib/aws.utils';
import AWSUtils from '../../config/aws.config';
import { sendNotificationToUser } from '../../lib/notification.utils';
import { sendQuoteAcceptedEmail, sendQuoteRejectedEmail } from '../../utils/sendEmail';

export default new (class CustomerJobService {
  async createJob(customerId: number, args: CreateJobData) {
    const {
      title,
      description,
      category_id,
      project_size,
      budget_min,
      budget_max,
      budget_type,
      work_finish_type,
      work_finish_from,
      work_finish_to,
      location,
      images,
    } = args;

    // Verify category exists
    const category = await JobCategory.findOne({ where: { id: category_id } });
    if (!category) {
      Utils.throwError(ErrorMsg.JOBCATEGORY.notFound);
    }
    const lastJob = await Job.findOne({
      order: [['id', 'DESC']],
      attributes: ['job_id'],
    });

    let job_id = 'JOB10001';

    if (lastJob?.job_id) {
      // Extract numeric part (e.g. JOB10001 -> 10001)
      const lastNumber = parseInt(lastJob.job_id.replace('JOB', ''), 10);

      // Increment and format
      job_id = `JOB${lastNumber + 1}`;
    }

    const jobData: any = {
      job_id,
      customer_id: customerId,
      title,
      description,
      category_id,
      project_size,
      budget_type,
      work_finish_type,
      location,
      images: images || [],
      progress_status: JobProgressStatus.STATUS.TASK_POSTED,
    };

    if (budget_min !== undefined) jobData.budget_min = budget_min;
    if (budget_max !== undefined) jobData.budget_max = budget_max;
    if (work_finish_from) jobData.work_finish_from = new Date(work_finish_from);
    if (work_finish_to) jobData.work_finish_to = new Date(work_finish_to);

    const newJob = await Job.create(jobData);

    const jobWithRelations = await Job.findOne({
      where: { id: newJob.id },
      include: [
        { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'profile_image'] },
      ],
    });

    return {
      message: SuccessMsg.JOB.create,
      job: jobWithRelations,
    };
  }

  async deleteJob(customerId: number, jobId: number) {
    const job = await Job.findOne({
      where: { id: jobId, customer_id: customerId },
    });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    // Check if job has accepted bids
    // const acceptedJob = await AcceptedJob.findOne({ where: { job_id: jobId } });
    // if (acceptedJob) {
    //   Utils.throwError(ErrorMsg.JOB.cannotDelete);
    // }
    if (job.images) {
      if (job.images && job.images.length > 0) {
        for (const imageUrl of job.images) {
          const key = imageUrl.replace('/job_images/', 'job_images/'); // replace key path
          await removeFileFromS3({ Bucket: AWSUtils.s3BucketName, Key: key });
        }
      }
    }
    await Job.destroy({ where: { id: jobId, customer_id: customerId } });

    return {
      message: SuccessMsg.JOB.delete,
    };
  }

  async getCustomerJobs(args: ISearch, customerId: number) {
    const { page, limit, search } = args;
    const skip = (page - 1) * limit;

    const whereClause: any = { customer_id: customerId };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (args.status) {
      whereClause.status = args.status;
    }

    const totalCount = await Job.count({ where: whereClause });
    const totalPage = Math.ceil(totalCount / limit);

    const jobs = await Job.findAll({
      where: whereClause,
      include: [{ model: JobCategory, as: 'category', attributes: ['id', 'name'] }],
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
      jobs,
    };
  }

  async getJobById(jobId: number, customerId: number) {
    const jobs = await Job.findAll({
      where: { id: jobId, customer_id: customerId },
      include: [
        { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'profile_image'] },
      ],
      order: [['created_at', 'DESC']],
      raw: true,
      nest: true,
    });
    if (!jobs) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }
    const formattedJobs = jobs.map((job) => {
      const { customer, ...rest } = job;
      return {
        ...rest,
        user: customer,
      };
    });

    return {
      message: SuccessMsg.JOB.get,
      jobs: formattedJobs,
    };
  }

  async getJobProfessionals(args: ISearch, customerId: number) {
    const { page, limit, search, pending, accepted, completed } = args;
    const skip = (page - 1) * limit;

    let jobs: IJob[] = [];

    // 1️⃣ Fetch jobs based on status
    const statusFilter: string[] = [];
    if (pending) statusFilter.push('open', 'in_progress');

    if (accepted) statusFilter.push('in_progress');
    if (completed) statusFilter.push('completed');

    jobs = await Job.findAll({
      where: { customer_id: customerId, status: statusFilter },
      attributes: [
        'id',
        'title',
        'description',
        'images',
        'project_size',
        'budget_min',
        'budget_max',
        'work_finish_type',
        'work_finish_from',
        'work_finish_to',
        'location',
        'status',
        'progress_status',
        'is_job_started',
        'is_job_completed',
      ],
    });

    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return {
        message: 'No professionals found',
        page,
        perPage: limit,
        totalCount: 0,
        totalPage: 0,
        professionals: [],
      };
    }

    const jobMap = new Map<number, IJob>();
    jobs.forEach((job: IJob) => jobMap.set(job.id!, job));

    const combinationMap = new Map<string, any>();

    // if (pending) {
    //   // Get all likes for these jobs
    //   const likedList = await JobLike.findAll({
    //     where: { job_id: jobIds },
    //     include: [
    //       {
    //         model: User,
    //         as: 'professional',
    //         attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
    //       },
    //     ],
    //   });

    //   // Get all bids with status pending/rejected
    //   const bidList = await JobBid.findAll({
    //     where: { job_id: jobIds, status: ['pending', 'rejected'] },
    //     include: [
    //       {
    //         model: User,
    //         as: 'professional',
    //         attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
    //       },
    //     ],
    //   });

    //   // Get all accepted bids for filtering
    //   const acceptedBids = await JobBid.findAll({
    //     where: { job_id: jobIds, status: 'accepted' },
    //     attributes: ['job_id', 'professional_id'],
    //   });
    //   const acceptedSet = new Set(acceptedBids.map((b) => `${b.job_id}-${b.professional_id}`));

    //   // Build combination map
    //   likedList.forEach((like) => {
    //     const key = `${like.job_id}-${like.professional_id}`;
    //     // Exclude if accepted bid exists
    //     if (!acceptedSet.has(key)) {
    //       combinationMap.set(key, {
    //         job: jobMap.get(like.job_id),
    //         professional_id: like.professional_id,
    //         professional: like.professional,
    //         liked: true,
    //         bid: null,
    //       });
    //     }
    //   });

    //   bidList.forEach((bid) => {
    //     const key = `${bid.job_id}-${bid.professional_id}`;
    //     if (!acceptedSet.has(key)) {
    //       if (combinationMap.has(key)) {
    //         combinationMap.get(key).bid = bid;
    //       } else {
    //         combinationMap.set(key, {
    //           job: jobMap.get(bid.job_id),
    //           professional_id: bid.professional_id,
    //           professional: bid.professional,
    //           liked: false,
    //           bid: bid,
    //         });
    //       }
    //     }
    //   });
    // }

    if (pending) {
      // Get all likes for these jobs
      const likedList = await JobLike.findAll({
        where: { job_id: jobIds },
        include: [
          {
            model: User,
            as: 'professional',
            attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
          },
        ],
        order: [['created_at', 'DESC']], // ✅ Order likes by createdAt desc
      });

      // Get all bids with status pending/rejected
      const bidList = await JobBid.findAll({
        where: { job_id: jobIds, status: ['pending', 'rejected'] },
        include: [
          {
            model: User,
            as: 'professional',
            attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
          },
        ],
      });

      // Get all accepted bids for filtering
      const acceptedBids = await JobBid.findAll({
        where: { job_id: jobIds, status: 'accepted' },
        attributes: ['job_id', 'professional_id'],
      });
      const acceptedSet = new Set(acceptedBids.map((b) => `${b.job_id}-${b.professional_id}`));

      // Merge likes and bids based on job+professional, respecting like createdAt order
      likedList.forEach((like) => {
        const key = `${like.job_id}-${like.professional_id}`;
        if (!acceptedSet.has(key)) {
          combinationMap.set(key, {
            job: jobMap.get(like.job_id),
            professional_id: like.professional_id,
            professional: like.professional,
            liked: true,
            bid: null,
            likeCreatedAt: like.created_at, // store for sorting later
          });
        }
      });

      bidList.forEach((bid) => {
        const key = `${bid.job_id}-${bid.professional_id}`;
        if (!acceptedSet.has(key)) {
          if (combinationMap.has(key)) {
            combinationMap.get(key).bid = bid;
          } else {
            combinationMap.set(key, {
              job: jobMap.get(bid.job_id),
              professional_id: bid.professional_id,
              professional: bid.professional,
              liked: false,
              bid: bid,
              likeCreatedAt: bid.created_at, // optional fallback if no like
            });
          }
        }
      });

      // ✅ Sort combination map by likeCreatedAt desc
    }

    // 3️⃣ Accepted: accepted jobs
    if (accepted) {
      const acceptedJobs = await AcceptedJob.findAll({
        where: { job_id: jobIds },
        include: [
          {
            model: Job,
            as: 'job',
            attributes: [
              'id',
              'title',
              'description',
              'images',
              'project_size',
              'budget_min',
              'budget_max',
              'work_finish_type',
              'work_finish_from',
              'work_finish_to',
              'location',
              'status',
              'progress_status',
              'is_job_started',
              'is_job_completed',
            ],
          },
          {
            model: JobBid,
            as: 'bid',
            include: [
              {
                model: User,
                as: 'professional',
                attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
              },
            ],
          },
          {
            model: User,
            as: 'professional',
            attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
          },
        ],
      });

      acceptedJobs.forEach((entry: IAcceptedJob) => {
        const key = `${entry.job_id}-${entry.professional_id}`;
        combinationMap.set(key, {
          job: entry.job,
          professional_id: entry.professional_id,
          professional: entry.professional || entry.bid?.professional,
          liked: false,
          bid: entry.bid,
          acceptedJobCreatedAt: entry.created_at,
        });
      });
    }

    // 4️⃣ Completed: completed jobs
    if (completed) {
      const completedJobs = await AcceptedJob.findAll({
        where: { job_id: jobIds },
        include: [
          {
            model: Job,
            as: 'job',
            where: { status: 'completed' },
            attributes: [
              'id',
              'title',
              'description',
              'images',
              'project_size',
              'budget_min',
              'budget_max',
              'work_finish_type',
              'work_finish_from',
              'work_finish_to',
              'location',
              'status',
              'progress_status',
              'is_job_started',
              'is_job_completed',
            ],
            include: [
              {
                model: Rating,
                as: 'ratings',
                attributes: ['id', 'rating', 'created_at'],
                where: {
                  customer_id: customerId,
                  rating_by: 'customer',
                },
                required: false,
              },
            ],
          },
          {
            model: JobBid,
            as: 'bid',
            include: [
              {
                model: User,
                as: 'professional',
                attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
              },
            ],
          },
          {
            model: User,
            as: 'professional',
            attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
          },
        ],
      });

      completedJobs.forEach((entry: IAcceptedJob) => {
        const key = `${entry.job_id}-${entry.professional_id}`;
        combinationMap.set(key, {
          job: entry.job,
          professional_id: entry.professional_id,
          professional: entry.professional || entry.bid?.professional,
          liked: false,
          bid: entry.bid,
          acceptedJobCreatedAt: entry.created_at,
        });
      });
    }
    let finalList: any[] = Array.from(combinationMap.values());

    // 6️⃣ Sort by likeCreatedAt descending **only if pending flag is set**
    finalList.sort((a, b) => {
      if (pending && a.liked && b.liked) {
        return (b.likeCreatedAt?.getTime() || 0) - (a.likeCreatedAt?.getTime() || 0);
      }

      if (accepted && a.acceptedJobCreatedAt && b.acceptedJobCreatedAt) {
        return (b.acceptedJobCreatedAt.getTime() || 0) - (a.acceptedJobCreatedAt.getTime() || 0);
      }
      if (completed && a.acceptedJobCreatedAt && b.acceptedJobCreatedAt) {
        return (b.acceptedJobCreatedAt.getTime() || 0) - (a.acceptedJobCreatedAt.getTime() || 0);
      }

      return 0;
    });

    // 7️⃣ Optional search
    if (search) {
      const lowerSearch = search.toLowerCase();
      finalList = finalList.filter((item) =>
        item.professional?.name?.toLowerCase().includes(lowerSearch),
      );
    }

    // 6️⃣ Optional search
    if (search) {
      const lowerSearch = search.toLowerCase();
      finalList = finalList.filter((item) =>
        item.professional?.name?.toLowerCase().includes(lowerSearch),
      );
    }

    // 7️⃣ Pagination
    const totalCount = finalList.length;
    const totalPage = Math.ceil(totalCount / limit);
    const paginatedList = finalList.slice(skip, skip + limit);

    return {
      message: 'Professionals fetched successfully',
      page,
      perPage: limit,
      totalCount,
      totalPage,
      professionals: paginatedList,
    };
  }

  async getJobProfessionalDetail(customerId: number, jobId: number, professionalId: number) {
    // 1️⃣ Verify job belongs to customer
    const job = await Job.findOne({
      where: { id: jobId, customer_id: customerId },
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

    // 2️⃣ Get professional details
    const professional = await User.findOne({
      where: { id: professionalId, role: 'professional' },
      attributes: [
        'id',
        'name',
        'email',
        'mobile_number',
        'profile_image',
        'service_category',
        'account_status',
        'is_verified',
      ],
    });

    if (!professional) {
      Utils.throwError(ErrorMsg.USER.notFound);
    }

    // 3️⃣ Get bid details (if exists)
    const bid = await JobBid.findOne({
      where: { job_id: jobId, professional_id: professionalId },
      // include: [
      //   {
      //     model: User,
      //     as: 'professional',
      //     attributes: ['id', 'name', 'email', 'mobile_number', 'profile_image'],
      //   },
      // ],
    });

    // 4️⃣ Get like status
    const like = await JobLike.findOne({
      where: { job_id: jobId, professional_id: professionalId },
    });

    // 5️⃣ Get accepted job status
    const acceptedJob = await AcceptedJob.findOne({
      where: { job_id: jobId, professional_id: professionalId },
      // include: [
      //   {
      //     model: JobBid,
      //     as: 'bid',
      //     attributes: ['id', 'amount', 'message', 'currency', 'status', 'created_at'],
      //   },
      // ],
    });

    // 6️⃣ Get category names for professional's service categories
    const allCategories = await JobCategory.findAll({
      attributes: ['id', 'name'],
    });
    const categoryMap = allCategories.reduce(
      (acc, cat) => {
        acc[cat.id!] = cat.name;
        return acc;
      },
      {} as Record<number, string>,
    );

    const professionalData = professional.toJSON();
    const serviceCategories =
      professionalData.service_category?.map((id: number) => ({
        id,
        name: categoryMap[id] || null,
      })) || [];

    const rating = await Rating.findOne({
      where: { job_id: jobId, rating_by: 'customer', customer_id: customerId },
      raw: true,
    });
    if (rating) {
      job.is_rating_submitted = true;
      job.rating = rating.rating;
    } else {
      job.is_rating_submitted = false;
    }

    return {
      message: SuccessMsg.JOB.get,
      job: job,
      professional: {
        ...professionalData,
        service_category: serviceCategories,
      },
      bid: bid || null,
      liked: !!like,
      accepted: !!acceptedJob,
      acceptedJob: acceptedJob || null,
    };
  }

  async acceptOrRejectedBid(
    customerId: number,
    job_id: number,
    // bidId: number,
    // action: 'accept' | 'reject',
    args: { bid_id: number; status: string },
  ) {
    const { bid_id: bidId, status: action } = args;
    // 1️⃣ Fetch bid + its job
    const bid = await JobBid.findOne({
      where: { id: bidId, job_id }, // ensure bid belongs to job
      include: [{ model: Job, as: 'job' }],
    });

    // 2️⃣ Bid not found or does not belong to job
    if (!bid) {
      Utils.throwError(ErrorMsg.JOB.bidNotFound);
    }

    const job = (bid as any).job;

    // 3️⃣ Check job exists and belongs to this customer
    if (!job || job.customer_id !== customerId) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    // 4️⃣ Validate bid status
    if (bid.status === 'accepted') {
      Utils.throwError(ErrorMsg.JOB.bidAlreadyAccepted);
    }

    if (bid.status === 'rejected') {
      Utils.throwError(ErrorMsg.JOB.bidAlreadyRejected);
    }

    if (action === 'accept') {
      // 5️⃣ Reject all other pending bids for this job
      await JobBid.update(
        { status: 'rejected' },
        {
          where: {
            job_id,
            id: { [Op.ne]: bidId },
            status: 'pending',
          },
        },
      );

      // 6️⃣ Accept the selected bid
      await JobBid.update({ status: 'accepted' }, { where: { id: bidId } });

      // 7️⃣ Create entry in accepted_jobs table
      await AcceptedJob.create({
        job_id,
        bid_id: bidId,
        professional_id: bid.professional_id,
        customer_id: customerId,
        accepted_at: new Date(),
      });

      // 8️⃣ Update job status
      await Job.update(
        { status: 'in_progress', progress_status: JobProgressStatus.STATUS.QUOTE_ACCEPTED },
        { where: { id: job_id } },
      );
      const professional = await User.findOne({
        where: { id: bid.professional_id },
        attributes: ['name', 'email'],
        raw: true,
      });
      const notification = NotificationTemplates.QUOTE_ACCEPTED(job.title);
      void sendNotificationToUser({
        user_id: bid.professional_id,
        title: notification.title,
        message: notification.message, // generic message
        notification_type: notification.notification_type,
        type: notification.type,
        job_id: job.id,
      });
      if (professional?.email) {
        sendQuoteAcceptedEmail({
          email: professional.email,
          professionalName: professional.name,
          jobTitle: job.title,
          jobId: job.id,
          quoteAmount: bid.amount,
          currency: bid.currency,
          jobLocation: job.location, // if available
        });
      }
    } else if (action === 'reject') {
      // Reject the bid
      await JobBid.update({ status: 'rejected' }, { where: { id: bidId } });
      const notification = NotificationTemplates.QUOTE_REJECTED(job.title);
      void sendNotificationToUser({
        user_id: bid.professional_id,
        title: notification.title,
        message: notification.message, // generic message
        notification_type: notification.notification_type,
        type: notification.type,
        job_id: job.id,
      });

      const professional = await User.findOne({
        where: { id: bid.professional_id },
        attributes: ['name', 'email'],
        raw: true,
      });

      if (professional?.email) {
        sendQuoteRejectedEmail({
          email: professional.email,
          professionalName: professional.name,
          jobTitle: job.title,
          jobId: job.id,
          quoteAmount: bid.amount,
          currency: bid.currency,
          jobLocation: job.location, // if available
        });
      }
    } else {
      Utils.throwError('Invalid action. Must be "accept" or "reject".');
    }

    // 9️⃣ Fetch updated bid details
    const updatedBid = await JobBid.findOne({
      where: { id: bidId },
      include: [
        {
          model: User,
          as: 'professional',
          attributes: ['id', 'name', 'email', 'profile_image'],
        },
        { model: Job, as: 'job' },
      ],
    });

    return {
      message: action === 'accept' ? SuccessMsg.JOB.acceptBid : SuccessMsg.JOB.rejectBid,
      bid: updatedBid,
    };
  }

  async getProfessionalsByCategory(args: ISearch, categoryId: number) {
    const { page, limit, search } = args;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      role: 'professional',
    };

    const category = await Job.findOne({ where: { id: categoryId } });
    if (!category) {
      Utils.throwError(ErrorMsg.JOBCATEGORY.notFound);
    }
    whereClause.service_category = { [Op.contains]: [category.category_id] };

    // 2️⃣ Find professionals already selected for this job
    const acceptedProfessionals = await JobLike.findAll({
      where: { job_id: categoryId },
      attributes: ['professional_id'],
    });
    const excludedProfessionalIds = acceptedProfessionals.map((aj) => aj.professional_id);

    if (excludedProfessionalIds.length > 0) {
      whereClause.id = { [Op.notIn]: excludedProfessionalIds };
    }

    const totalCount = await User.count({ where: whereClause });
    const totalPage = Math.ceil(totalCount / limit);

    // Get professionals who have this category in their service_category array
    const professionals = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'profile_image', 'service_category'],
      offset: skip,
      limit: limit,
    });

    const allCategories = await JobCategory.findAll({
      attributes: ['id', 'name'],
    });
    const categoryMap = allCategories.reduce(
      (acc, cat) => {
        acc[cat.id!] = cat.name;
        return acc;
      },
      {} as Record<number, string>,
    );

    // Map category names to each professional
    const professionalsWithCategoryNames = professionals.map((prof) => {
      const categories =
        prof.service_category?.map((id) => ({
          id,
          name: categoryMap[id] || null, // fallback to null if not found
        })) || [];

      return {
        ...prof.toJSON(),
        service_category: categories, // now contains [{id, name}, ...]
      };
    });

    return {
      message: SuccessMsg.PROFESSIONAL.get,
      page: page,
      perPage: limit,
      totalCount: totalCount,
      totalPage: totalPage,
      professionals: professionalsWithCategoryNames,
    };
  }

  async swipeProfessional(customerId: number, args: SwipeData) {
    const { job_id, professional_id } = args;

    // Verify job belongs to customer
    const job = await Job.findOne({
      where: { id: job_id, customer_id: customerId },
    });

    if (!job) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    // Verify professional exists
    const professional = await User.findOne({
      where: { id: professional_id, role: 'professional' },
    });

    if (!professional) {
      Utils.throwError(ErrorMsg.USER.notFound);
    }

    // Only handle left swipe (creates JobLike)

    const existingLike = await JobLike.findOne({
      where: { job_id, professional_id },
    });

    if (!existingLike) {
      // Create new JobLike record
      await JobLike.create({
        job_id,
        professional_id,
      });
    }

    return {
      message: SuccessMsg.JOB.swipe,
    };
  }

  async markJobAsCompleted(customerId: number, jobId: number) {
    // 1️⃣ Check that the job exists in AcceptedJob table
    const acceptedJob = await AcceptedJob.findOne({
      where: { job_id: jobId },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'customer_id', 'status', 'title', 'description'],
        },
      ],
    });

    if (!acceptedJob) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    const job = (acceptedJob as any).job;

    // 2️⃣ Check that the job belongs to the given customerId
    if (!job || job.customer_id !== customerId) {
      Utils.throwError(ErrorMsg.JOB.notFound);
    }

    // 3️⃣ Check that the job status in jobs table is 'in_progress'
    if (job.status !== 'in_progress') {
      if (job.status === 'completed') {
        Utils.throwError(ErrorMsg.JOB.alreadyCompleted);
      }
      Utils.throwError(ErrorMsg.JOB.invalidStatus);
    }

    // 4️⃣ Update the job status to 'completed'
    await Job.update(
      { status: 'completed', progress_status: JobProgressStatus.STATUS.REVIEW_PAID },
      { where: { id: jobId } },
    );

    // 5️⃣ Fetch updated job with relations
    const updatedJob = await Job.findOne({
      where: { id: jobId },
      include: [
        { model: JobCategory, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'profile_image'] },
      ],
    });

    return {
      message: SuccessMsg.JOB.complete,
      job: updatedJob,
    };
  }
})();
