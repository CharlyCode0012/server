const MenuOptions = require('../models/menu_options');
const { Sequelize } = require('sequelize');

module.exports = (sequelize, type) => {
  const MenuAndOption = sequelize.define('menu_and_option', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menuID: {
      type: type.STRING(50),
      allowNull: false,
    },
    menuOptionsID: {
      type: type.STRING(50),
      allowNull: false,
    },
  });

  MenuAndOption.belongsTo(MenuOptions(sequelize, Sequelize), { foreignKey: 'menuOptionsID', as: 'menuOption' });

  return MenuAndOption;
};