import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';
import { IUser } from './user.model';

interface IJobBid extends Model {
  id?: number;
  job_id: number;
  professional_id: number;
  amount: number;
  message: string;
  currency: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
  professional?: IUser;
}

const defineJobBidModel = (sequelize: Sequelize) => {
  const JobBid = sequelize.define<IJobBid>(
    'JobBid',
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      timestamps: true,
      tableName: 'job_bids',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return JobBid;
};

const JobBid = defineJobBidModel(sequelize);

export { JobBid, IJobBid };
