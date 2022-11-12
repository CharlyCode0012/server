module.exports = (sequelize, type) =>{
    return sequelize.define('menu', {
        id:{
            type: type.STRING(50),
            primaryKey: true,
            autoIncrement: false
        },

        option_key:{
            type: type.STRING(100),
        },

        keywords: {
            type: type.STRING(100),
        }
    })
}