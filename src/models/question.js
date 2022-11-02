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
        },

        id_client:{
            type: type.STRING(20),
            references: {
                model:'clients',
                key: 'number'
            }
        },

        id_product:{
            type: type.INTEGER,
            references: {
                model:'products',
                key: 'id'
            }
        },
    })
}