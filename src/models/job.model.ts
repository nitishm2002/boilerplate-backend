import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';
import { IJobBid } from './jobBid.model';
import { IUser } from './user.model';

type JobProgressStatus =
  | 'job_posted'
  | 'quote_accepted'
  | 'check_in'
  | 'work_started'
  | 'job_completed'
  | 'review_paid';
interface IJob extends Model {
  id?: number;
  job_id: string;
  customer_id: number;
  title: string;
  description: string;
  category_id: number;
  project_size: string;
  budget_min?: number;
  budget_max?: number;
  work_finish_type: string;
  work_finish_from?: Date;
  work_finish_to?: Date;
  location: string;
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  budget_currency?: string;
  images?: string[];
  progress_status?: JobProgressStatus;
  created_at?: Date;
  updated_at?: Date;
  category?: {
    id: number;
    name: string;
  };
  bids?: IJobBid;
  liked?: boolean;
  is_rating_submitted?: boolean;
  rating?: number;
  customer?: IUser;
  is_job_started?: boolean;
  is_job_completed?: boolean;
}

const defineJobModel = (sequelize: Sequelize) => {
  const Job = sequelize.define<IJob>(
    'Job',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.STRING,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'job_categories',
          key: 'id',
        },
      },
      project_size: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      budget_min: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      budget_max: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      work_finish_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      work_finish_from: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      work_finish_to: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      location: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
      },
      budget_currency: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'USD', // optional default
      },
      progress_status: {
        type: DataTypes.ENUM(
          'job_posted',
          'quote_accepted',
          'check_in',
          'work_started',
          'job_completed',
          'review_paid',
        ),
        allowNull: false,
        defaultValue: 'job_posted',
      },
      is_job_started: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_job_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: 'jobs',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return Job;
};

const Job = defineJobModel(sequelize);

export { Job, IJob };
