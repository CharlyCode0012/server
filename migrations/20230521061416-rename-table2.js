'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable('menu_responses', 'response');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameTable('menu_responses', 'response');
  }
};