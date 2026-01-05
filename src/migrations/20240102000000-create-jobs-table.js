'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'job_categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      project_size: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      budget_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      budget_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      budget_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      work_finish_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      work_finish_from: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      work_finish_to: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'open',
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
        defaultValue: [],
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('jobs', ['customer_id']);

    await queryInterface.addIndex('jobs', ['category_id']);

    await queryInterface.addIndex('jobs', ['status']);

    await queryInterface.addIndex('jobs', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('jobs');
  },
};
