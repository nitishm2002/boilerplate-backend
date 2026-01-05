import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';
import { IJob } from './job.model';
import { IUser } from './user.model';
import { IJobBid } from './jobBid.model';

interface IAcceptedJob extends Model {
  id?: number;
  job_id: number;
  bid_id: number;
  professional_id: number;
  customer_id: number;
  accepted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  job?: IJob;
  professional?: IUser;
  bid?: IJobBid;
  pendingEarnings?: string;
  completedEarnings?: string;
}

const defineAcceptedJobModel = (sequelize: Sequelize) => {
  const AcceptedJob = sequelize.define<IAcceptedJob>(
    'AcceptedJob',
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
      bid_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'job_bids',
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
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'accepted_jobs',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return AcceptedJob;
};

const AcceptedJob = defineAcceptedJobModel(sequelize);

export { AcceptedJob, IAcceptedJob };
