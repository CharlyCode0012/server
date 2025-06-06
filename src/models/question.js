module.exports = (sequelize, type) =>{
    return sequelize.define('question', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        question:{
            type: type.TEXT,
        },

        state:{
            type: type.BOOLEAN,
            defaultValue: false,
        },

        id_client:{
            type: type.STRING(20),
            references: {
                model:'clients',
                key: 'number'
            },
            onDelete: 'cascade',
        },

        id_product:{
            type: type.STRING(50),
            references: {
                model:'products',
                key: 'id'
            },
            onDelete: 'cascade',
        },
    })
}