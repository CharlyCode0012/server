const { STRING } = require("sequelize");

module.exports = (sequelize, type) =>{
    return sequelize.define('places_deliverie', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        address:{
            type: type.TEXT('tiny'),
            allowNull: false
        },

        cp:{
            type: STRING(5),
            allowNull: false
        },

        open_h:{
            type: type.STRING(10),
            allowNull: false,
        },

        close_h:{
            type: type.STRING(10),
            allowNull: false,
        }
    });
}