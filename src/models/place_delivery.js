const { STRING } = require("sequelize");

module.exports = (sequelize, type) =>{
    return sequelize.define('places_deliverie', {
        id:{
            type: type.STRING(50),
            primaryKey: true,
            autoIncrement: false
        },

        name:{
            type: type.TEXT('tiny'),
            allowNull: false
        },
        address:{
            type: type.TEXT('tiny')
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