import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';

interface IEarlyAccess extends Model {
  id?: number;
  email: string;
  text: string;
  created_at?: Date;
  updated_at?: Date;
}

const defineEarlyAccessModel = (sequelize: Sequelize) => {
  const EarlyAccess = sequelize.define<IEarlyAccess>(
    'EarlyAccess',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'early_access',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return EarlyAccess;
};

// Initialize the EarlyAccess model
const EarlyAccess = defineEarlyAccessModel(sequelize);

export { EarlyAccess, IEarlyAccess };
