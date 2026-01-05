import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';

interface IUser extends Model {
  id?: number;
  name: string;
  mobile_number: string;
  email: string;
  password: string;
  role: string;
  is_verified: string;
  account_status: string;
  fcm_token?: string[];
  profile_image?: string;
  service_category: number[];
  average_rating?: number;
  total_ratings?: number;
}

// Use Sequelize as the type for the parameter
const defineUserModel = (sequelize: Sequelize) => {
  const User = sequelize.define<IUser>(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING(50),
      mobile_number: DataTypes.STRING(15),
      email: {
        type: DataTypes.STRING(50),
        allowNull: true,
        set(this: IUser, value: string) {
          this.setDataValue('email', value.toLowerCase());
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fcm_token: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        defaultValue: [],
      },
      account_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      profile_image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      service_category: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: [],
      },
      average_rating: {
        type: DataTypes.DECIMAL(3, 1), // max 5.0
        allowNull: true,
        defaultValue: 0.0,
      },
      total_ratings: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      tableName: 'users',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return User;
};

// Initialize the User model
const User = defineUserModel(sequelize);

export { User, IUser };
