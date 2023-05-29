'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'date_delivery', {
      type: Sequelize.DATEONLY, 
      allowNull: true, // Define si el campo permite valores nulos o no
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'date_delivery', {
      type: Sequelize.DATEONLY, 
      allowNull: true, // Define si el campo permite valores nulos o no
    });
  }
};