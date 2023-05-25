'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('nombre_tabla', 'nombre_campo_actual', 'nombre_campo_nuevo'),
      queryInterface.addColumn('nombre_tabla', 'nuevo_campo', {
        type: Sequelize.STRING, // Define el tipo de datos del nuevo campo
        allowNull: true // Define si el nuevo campo permite valores nulos o no
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('nombre_tabla', 'nombre_campo_nuevo', 'nombre_campo_actual'),
      queryInterface.removeColumn('nombre_tabla', 'nuevo_campo')
    ]);
  }
};
