module.exports = (sequelize, type) =>{
    return sequelize.define('shopping', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            atuoIncrement: true
        },

        quantity:{
            type: type.SMALLINT
        },

        date_purchase:{
            type: type.DATEONLY
        },

        id_product:{
            type: type.INTEGER,
            references: {
                model:'products',
                key: 'id'
            },
        },

        id_client:{
            type: type.STRING(20),
            references: {
                model:'clients',
                key: 'number'
            },
        }
        
    })
}