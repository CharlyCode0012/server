module.exports = (sequelize, type) =>{
    return sequelize.define('order_detail', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        quantity:{
            type: type.SMALLINT,
        },

        price:{
            type: type.DOUBLE,
        },

        id_order:{
            type: type.INTEGER,
            references: {
                model:'orders',
                key: 'id'
            },
        },

        id_product:{
            type: type.INTEGER,
            references: {
                model:'products',
                key: 'id'
            },
        },
    })
}