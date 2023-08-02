const { Sequelize } = require('sequelize');
const Catalog = require('../models/catalog');
const Menu = require('../models/menus');

module.exports = (sequelize, type) => {
    const MenuOption = sequelize.define('menu_option', {
        id: {
            type: type.STRING(50),
            primaryKey: true,
            autoIncrement: false,
        },
		answer: {
			type: type.STRING,
			allowNull: true,
		},	
        option: {
            type: type.STRING,
            allowNull: false,
        },
        keywords: {
            type: type.STRING,
            allowNull: false,
        },
        action_type: {
            type: type.STRING,
            allowNull: false,
        },
        reference: {
            type: type.STRING,
            allowNull: true,
        },
    });

    
        MenuOption.belongsTo(Catalog(sequelize, Sequelize), { foreignKey: 'catalogId', as: 'catalog' });
        MenuOption.belongsTo(Menu(sequelize, Sequelize), { foreignKey: 'submenuId', as: 'submenu' });
    

    return MenuOption;
};