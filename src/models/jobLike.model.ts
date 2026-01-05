import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';
import { IJob } from './job.model';
import { IUser } from './user.model';

interface IJobLike extends Model {
  id?: number;
  job_id: number;
  professional_id: number;
  is_bid_submitted?: boolean;
  job?: IJob;
  professional?: IUser;
  created_at?: Date;
  updated_at?: Date;
}

const defineJobLikeModel = (sequelize: Sequelize) => {
  const JobLike = sequelize.define<IJobLike>(
    'JobLike',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
      },
      professional_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      is_bid_submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: 'job_likes',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['job_id', 'professional_id'],
        },
      ],
    },
  );
  return JobLike;
};

const JobLike = defineJobLikeModel(sequelize);

export { JobLike, IJobLike };
