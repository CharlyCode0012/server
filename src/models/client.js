module.exports = (sequelize, type) =>{
    return sequelize.define('client',{
        id:{
            type: type.INTEGER,
        },

        number:{
            type: type.STRING(20),
            primaryKey: true,
            autoIncrement: false
        },

        purcharses:{
            type: type.INTEGER,
            allowNull: false
        }
    })
}