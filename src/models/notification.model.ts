import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';

interface INotification extends Model {
  id?: string;
  user_id: number;
  notification_type: string;
  type: string;
  title: string;
  message: string;
  job_id?: number | null;
  chat_id?: string | null;
  is_read_user?: boolean;
  is_deleted_user?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const defineNotificationModel = (sequelize: Sequelize) => {
  const Notification = sequelize.define<INotification>(
    'Notification',
    {
      id: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notification_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      chat_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_read_user: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_deleted_user: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: 'notifications',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Notification;
};

// Initialize the Notification model
const Notification = defineNotificationModel(sequelize);

export { Notification, INotification };
