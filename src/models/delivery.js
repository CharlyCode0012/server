module.exports = (sequelize, type) =>{
    return sequelize.define('deliverie', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        folio:{
            type: type.STRING(50),
        },

        date_delivery:{
            type: type.DATEONLY,
        },

        rest:{
            type: type.DOUBLE,
        },

        state:{
            type: type.BOOLEAN
        },

        id_client:{
            type: type.STRING(20),
            references: {
                model:'clients',
                key: 'number'
            },
        },

        id_place:{
            type: type.INTEGER,
            references: {
                model:'places_deliveries',
                key: 'id'
            },
        },

        id_order:{
            type: type.INTEGER,
            references: {
                model:'orders',
                key: 'id'
            },
        },
    })
}