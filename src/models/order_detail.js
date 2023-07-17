module.exports = (sequelize, type) =>{
    const OrderDetail = sequelize.define('order_detail', {
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

        total_price:{
            type: type.DOUBLE,
        },

        id_order:{
            type: type.INTEGER,
            references: {
                model:'orders',
                key: 'id'
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

    return OrderDetail;
}