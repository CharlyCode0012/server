'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable('menus', 'initial');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameTable('menus', 'initial');
  }
};