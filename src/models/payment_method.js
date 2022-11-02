module.exports = (sequelize, type) =>{
    return sequelize.define('payment_method', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CLABE:{
            type: type.STRING(30),
            allowNUll: false
        },
        no_card:{
            type: type.STRING(30),
            allowNUll: false
        },
        bank:{
            type: type.TEXT('tiny'),
            allowNUll: false
        },
        subsidary:{
            type: type.STRING(200),
            allowNUll: false,
        }
    })
}