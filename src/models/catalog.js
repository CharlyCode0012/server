module.exports = (sequelize, type) =>{
    return sequelize.define('catalog', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name:{
            type: type.STRING(20),
            allowNull: false
        },

        description:{
            type: type.TEXT('tiny'),
            allowNull: false
        },

        state:{
            type: type.BOOLEAN,
            allowNull: false
        }
    });
}