'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sold_products', 'id_order', {
      type: Sequelize.INTEGER,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sold_products', 'id_order');
  }
};