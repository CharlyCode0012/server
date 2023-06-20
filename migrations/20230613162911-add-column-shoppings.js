'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('shopping', 'folio', {
      type: Sequelize.STRING,
      allowNull: true, // Puedes cambiar a 'false' si el campo es obligatorio
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('shopping', 'folio');
  },
};
