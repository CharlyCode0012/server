module.exports = (sequelize, type) =>{
    return sequelize.define('categorie', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name:{
            type: type.STRING(100),
            allowNUll: false
        },
        state:{
            type: type.BOOLEAN,
            allowNUll: false
        }
    })
}