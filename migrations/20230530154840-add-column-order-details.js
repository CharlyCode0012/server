'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('order_details', 'total_price', {
      type: Sequelize.DOUBLE, 
      allowNull: true, // Define si el campo permite valores nulos o no
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('order_deatils', 'dtotal_price', {
      type: Sequelize.DOUBLE, 
      allowNull: true, // Define si el campo permite valores nulos o no
    });
  }
};