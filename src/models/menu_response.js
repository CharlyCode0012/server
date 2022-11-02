module.exports = (sequelize, type) =>{
    return sequelize.define('menu_response', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        option_key:{
            type: type.STRING(100),
        },

        reply_message:{
            type: type.STRING(100),
        },

        trigger:{
            type:  type.STRING(45),
        },

        media:{
            type: type.STRING(200),
        }
    })
}