'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize){
    await queryInterface.renameColumn('categories', 'name', 'category_name');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('categories', 'name', 'category_name');
  }
};
