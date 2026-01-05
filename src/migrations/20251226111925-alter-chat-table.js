import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('chats', 'last_message', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn('chats', 'last_message_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await queryInterface.addColumn('chats', 'last_message_sender_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.addColumn('chats', 'customer_unread_count', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('chats', 'professional_unread_count', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('chats', 'last_message');
  await queryInterface.removeColumn('chats', 'last_message_at');
  await queryInterface.removeColumn('chats', 'last_message_sender_id');
  await queryInterface.removeColumn('chats', 'customer_unread_count');
  await queryInterface.removeColumn('chats', 'professional_unread_count');
}
