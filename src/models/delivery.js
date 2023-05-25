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
        
        id_order:{
            type: type.INTEGER,
            references: {
                model:'orders',
                key: 'id'
            },
            onDelete: 'cascade',
        },
    })
}