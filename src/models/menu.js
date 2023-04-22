module.exports = (sequelize, type) =>{
    return sequelize.define('menus', {
        id:{
            type: type.STRING(50),
            primaryKey: true,
            autoIncrement: false
        },

        title:{
            type: type.STRING(50),
        },

        instruction:{
            type: type.STRING(300),
        },

        option: {
            type: type.STRING(50),
            references: {
                model: 'menu_options',
                key: 'id'
            },
            onDelete: 'cascade',
            allowNull: true
        }
    })
}