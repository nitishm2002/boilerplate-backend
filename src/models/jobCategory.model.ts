import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';

interface IJobCategory extends Model {
  id?: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

const defineJobCategoryModel = (sequelize: Sequelize) => {
  const JobCategory = sequelize.define<IJobCategory>(
    'JobCategory',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'job_categories',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return JobCategory;
};

// Initialize the JobCategory model
const JobCategory = defineJobCategoryModel(sequelize);

export { JobCategory, IJobCategory };
