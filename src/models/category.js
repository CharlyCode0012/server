module.exports = (sequelize, type) =>{
    return sequelize.define('categorie', {
        id:{
            type: type.STRING(50),
            primaryKey: true,
            autoIncrement: false
        },
        category_name:{
            type: type.STRING(100),
            allowNUll: false
        },
        description: {
            type: type.STRING(100),
            allowNUll: false 
        },
        state:{
            type: type.BOOLEAN,
            allowNUll: false
        }
    })
}