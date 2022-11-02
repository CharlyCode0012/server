module.exports = (sequelize, type) =>{
    return sequelize.define('catalog_product', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_product:{
            type: type.INTEGER,
            references: {
                model:'products',
                key: 'id'
            },
            allowNull: false
        },

        id_catalog:{
            type: type.INTEGER,
            references: {
                model:'catalogs',
                key: 'id'
            },
            allowNull: false
        }
    });
}