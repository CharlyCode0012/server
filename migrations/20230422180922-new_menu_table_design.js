'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('menu_options', {
      id:{
        type: Sequelize.STRING(50),
        primaryKey: true,
        autoIncrement: false
    },

    index: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    brief:{
        type: Sequelize.STRING(200),
        allowNull: false
    },

    description:{
        type: Sequelize.STRING(200),
        allowNull: true
    },

    keywords:{
        type: Sequelize.STRING(100),
        allowNull: false
    },

    menu:{
        type: Sequelize.STRING(50),
        references: {
            model: 'menus',
            key: 'id'
        },
        onDelete: 'cascade',
        allowNull: false
    },

    action_type:{
        type: Sequelize.ENUM('menu', 'catalog', 'link', 'message'),
        allowNull: false
    }
    });
    
    await queryInterface.removeColumn('menus', 'instruction');
    await queryInterface.addColumn('menus', 'instruction', {
      type: Sequelize.STRING(300),
    });

    await queryInterface.addColumn('menus', 'option', {
      type: Sequelize.STRING(50),
      references: {
          model: 'menu_options',
          key: 'id'
      },
      onDelete: 'cascade',
      allowNull: true
    });

    await queryInterface.removeColumn('menus', 'option_key');
    await queryInterface.removeColumn('menus', 'keywords');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable('menu_options');

    await queryInterface.removeColumn('menus', 'instruction');
    await queryInterface.removeColumn('menus', 'option');

    await queryInterface.addColumn('menus', 'option_key', {
      type: Sequelize.STRING(100),

    });

    await queryInterface.addColumn('menus', 'keywords', {
      type: Sequelize.STRING(100),
    });
  }
};
