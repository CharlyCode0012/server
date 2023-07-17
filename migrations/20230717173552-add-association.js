'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('order_details', 'id_order', {
      type: Sequelize.INTEGER,
      references: {
        model: 'orders',
        key: 'id',
      },
      onDelete: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('order_details', 'id_order');
  },
};
