'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'average_rating', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'total_ratings', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'average_rating');
    await queryInterface.removeColumn('users', 'total_ratings');
  },
};
