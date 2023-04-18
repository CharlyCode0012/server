module.exports = (sequelize, type) =>{
    return sequelize.define('user', {
        id:{
            type: type.STRING(50),
            primaryKey: true,
            autoIncrement: false
        },
        name:{
            type: type.STRING(50),
            allowNUll: false
        },
        date_B:{
            type: type.DATEONLY,
            allowNUll: false
        },
        type_use:{
            type: type.ENUM('admin', 'ayudante'),
            allowNUll: false
        },
        e_mail:{
            type: type.TEXT('tiny'),
            allowNUll: false
        },
        pass:{
            type: type.TEXT('tiny'),
            allowNUll: false
        },
        cel:{
            type: type.STRING(25),
            allowNUll: false
        }
    })
}