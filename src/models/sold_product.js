module.exports = (sequelize, type) =>{
    return sequelize.define('sold_product', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        quantity:{
            type: type.SMALLINT,
            allowNull: false
        },
        
        date_purchase:{
            type: type.DATEONLY,
            allowNull: false
        },

        id_category:{
            type: type.STRING(50),
            references: {
                model:'categories',
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
        
        id_order: {
            type: type.INTEGER, // Asegúrate de utilizar el tipo de dato correcto para la columna id_order
            references: {
              model: 'orders',
              key: 'id'
            },
            onDelete: 'cascade'
          }
    });
}
//ORM -> servidor mysql y backend