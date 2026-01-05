import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../connection/db.connection';

interface IChatMessage extends Model {
  id?: string;
  chat_id: string;
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const defineChatMessageModel = (sequelize: Sequelize) => {
  const ChatMessage = sequelize.define<IChatMessage>(
    'ChatMessage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Optional, DB can handle gen_random_uuid()
        primaryKey: true,
      },
      chat_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'chats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: 'chat_messages',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return ChatMessage;
};

const ChatMessage = defineChatMessageModel(sequelize);

export { ChatMessage, IChatMessage };
