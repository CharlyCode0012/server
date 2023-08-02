'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize){
    await queryInterface.renameColumn('menus', 'title', 'name');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('menus', 'title', 'name');
  }
};
