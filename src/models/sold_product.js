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
            type: type.INTEGER,
            references: {
                model:'categories',
                key: 'id'
            },
        },

        id_product:{
            type: type.INTEGER,
            references: {
                model:'products',
                key: 'id'
            },
            onDelete: 'cascade',
        }
    });
}
//ORM -> servidor mysql y backend