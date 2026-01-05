'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_likes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      professional_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('job_likes', ['job_id', 'professional_id'], {
      unique: true,
      name: 'job_likes_job_id_professional_id_unique',
    });

    await queryInterface.addIndex('job_likes', ['job_id']);

    await queryInterface.addIndex('job_likes', ['professional_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_likes');
  },
};
