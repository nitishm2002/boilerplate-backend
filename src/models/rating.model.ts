import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';
import { IAcceptedJob } from './acceptedJob.model';
import { IJob } from './job.model';
import { IUser } from './user.model';

interface IRating extends Model {
  id?: number;
  job_id: number;
  customer_id: number;
  professional_id: number;
  rating_by: 'customer' | 'professional';
  rating: number;
  created_at?: Date;
  updated_at?: Date;
  accepted_job?: IAcceptedJob;
  job?: IJob;
  from_user?: IUser;
  to_user?: IUser;
}

const defineRatingModel = (sequelize: Sequelize) => {
  const Rating = sequelize.define<IRating>(
    'Rating',
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
      rating_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      professional_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'ratings',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return Rating;
};

const Rating = defineRatingModel(sequelize);

export { Rating, IRating };

