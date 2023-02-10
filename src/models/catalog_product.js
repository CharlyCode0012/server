module.exports = (sequelize, type) =>{
    return sequelize.define('catalog_product', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_product:{
            type: type.STRING(50),
            references: {
                model:'products',
                key: 'id'
            },
            onDelete: 'cascade',
            allowNull: false
        },

        id_catalog:{
            type: type.STRING(50),
            references: {
                model:'catalogs',
                key: 'id'
            },
            onDelete: 'cascade',
            allowNull: false
        }
    });
}