'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('products', 'description', {
      type: Sequelize.STRING, 
      allowNull: true, // Define si el campo permite valores nulos o no
      defaultValue: '' // Define el valor por defecto del nuevo campo (opcional)
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
