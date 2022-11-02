module.exports = (sequelize, type) =>{
    return sequelize.define('menu', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        option_key:{
            type: type.STRING(100),
        },

        keywords: {
            type: type.STRING(100),
        }
    })
}