module.exports = (sequelize, type) =>{
    return sequelize.define('categories_product', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        }
    });
}