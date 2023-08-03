module.exports = (sequelize, type) =>{
    return sequelize.define('shopping', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        quantity:{
            type: type.SMALLINT
        },

        date_purchase:{
            type: type.DATEONLY
        },

        id_product:{
            type: type.STRING(50),
            references: {
                model:'products',
                key: 'id'
            },
            onDelete: 'cascade',
        },

        id_client:{
            type: type.STRING(20),
            references: {
                model:'clients',
                key: 'number'
            },
            onDelete: 'cascade',
        },
        id_order: {
            type: type.INTEGER,
            references: {
              model: 'orders',
              key: 'id'
            },
            onDelete: 'cascade'
          }
        
    })
}