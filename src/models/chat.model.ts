import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';
import { IJob } from './job.model';
import { IUser } from './user.model';

interface IChat extends Model {
  id?: string;
  job_id: number;
  customer_id: number;
  professional_id: number;
  created_at?: Date;
  updated_at?: Date;
  last_message: string | null;
  last_message_at: Date | null;
  last_message_sender_id: number | null;
  customer_unread_count: number;
  professional_unread_count: number;
  job?: IJob;
  customer?: IUser;
  professional: IUser;
}

const defineChatModel = (sequelize: Sequelize) => {
  const Chat = sequelize.define<IChat>(
    'Chat',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Optional: DB can handle gen_random_uuid()
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      professional_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      last_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      last_message_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_message_sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      customer_unread_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      professional_unread_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      tableName: 'chats',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Chat;
};

const Chat = defineChatModel(sequelize);

export { Chat, IChat };
