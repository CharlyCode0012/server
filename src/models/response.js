module.exports = (sequelize, type) =>{
    return sequelize.define('response', {
        option_key:{
            type: type.STRING(100),
            primaryKey: true,
            autoIncrement: false
        },

        reply_message:{
            type: type.STRING(100),
        },

        action_type:{
			type: type.ENUM('menu', 'catalog', 'link', 'message'),
			allowNull: false
		},

        trigger:{
            type:  type.STRING(45),
        },

        media:{
            type: type.STRING(200),
        }
    })
}