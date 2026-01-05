import { User, IUser } from './user.model';
import { Job, IJob } from './job.model';
import { JobLike, IJobLike } from './jobLike.model';
import { JobBid, IJobBid } from './jobBid.model';
import { AcceptedJob, IAcceptedJob } from './acceptedJob.model';
import { JobCategory, IJobCategory } from './jobCategory.model';
import { Rating, IRating } from './rating.model';
import { Chat, IChat } from './chat.model';
import { ChatMessage, IChatMessage } from './chatMessage.model';

// User associations
User.hasMany(Job, { foreignKey: 'customer_id', as: 'jobs' });
User.hasMany(JobLike, { foreignKey: 'professional_id', as: 'jobLikes' });
User.hasMany(JobBid, { foreignKey: 'professional_id', as: 'jobBids' });
User.hasMany(AcceptedJob, { foreignKey: 'customer_id', as: 'acceptedJobsAsCustomer' });
User.hasMany(AcceptedJob, { foreignKey: 'professional_id', as: 'acceptedJobsAsProfessional' });

// Job associations
Job.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Job.belongsTo(JobCategory, { foreignKey: 'category_id', as: 'category' });
Job.hasMany(JobLike, { foreignKey: 'job_id', as: 'likes' });
Job.hasOne(JobBid, { foreignKey: 'job_id', as: 'bids' });
Job.hasMany(AcceptedJob, { foreignKey: 'job_id', as: 'acceptedJob' });
Job.hasOne(Rating, { foreignKey: 'job_id', as: 'ratings' });

// JobLike associations
JobLike.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
JobLike.belongsTo(User, { foreignKey: 'professional_id', as: 'professional' });

// JobBid associations
JobBid.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
JobBid.belongsTo(User, { foreignKey: 'professional_id', as: 'professional' });
JobBid.hasOne(AcceptedJob, { foreignKey: 'bid_id', as: 'acceptedJob' });

// AcceptedJob associations
AcceptedJob.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
AcceptedJob.belongsTo(JobBid, { foreignKey: 'bid_id', as: 'bid' });
AcceptedJob.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
AcceptedJob.belongsTo(User, { foreignKey: 'professional_id', as: 'professional' });
// AcceptedJob.hasMany(Rating, { foreignKey: 'accepted_job_id', as: 'ratings' });

// JobCategory associations
JobCategory.hasMany(Job, { foreignKey: 'category_id', as: 'jobs' });

// Rating associations
// Rating.belongsTo(AcceptedJob, { foreignKey: 'accepted_job_id', as: 'accepted_job' });
Rating.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
// Rating.belongsTo(User, { foreignKey: 'from_user_id', as: 'from_user' });
// Rating.belongsTo(User, { foreignKey: 'to_user_id', as: 'to_user' });

// Chat associations
Chat.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Chat.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Chat.belongsTo(User, { foreignKey: 'professional_id', as: 'professional' });
Chat.hasMany(ChatMessage, { foreignKey: 'chat_id', as: 'messages' });

// ChatMessage associations
ChatMessage.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// // User rating associations
// User.hasMany(Rating, { foreignKey: 'from_user_id', as: 'ratingsGiven' });
// User.hasMany(Rating, { foreignKey: 'to_user_id', as: 'ratingsReceived' });

export {
  User,
  IUser,
  Job,
  IJob,
  JobLike,
  IJobLike,
  JobBid,
  IJobBid,
  AcceptedJob,
  IAcceptedJob,
  JobCategory,
  IJobCategory,
  Rating,
  IRating,
  Chat,
  IChat,
  ChatMessage,
  IChatMessage,
};
