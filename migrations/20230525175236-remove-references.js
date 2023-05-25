'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('deliveries', 'id_client');
    await queryInterface.removeColumn('deliveries', 'id_place');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('deliveries', 'id_client', {
      type: Sequelize.STRING(20),
      references: {
        model: 'clients',
        key: 'number'
      },
      onDelete: 'cascade'
    });
    await queryInterface.addColumn('deliveries', 'id_place', {
      type: Sequelize.STRING(50),
      references: {
        model: 'places_deliveries',
        key: 'id'
      },
      onDelete: 'cascade'
    });
  }
};
