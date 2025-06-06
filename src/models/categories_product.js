module.exports = (sequelize, type) =>{
    return sequelize.define('categories_product', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        }
    });
}