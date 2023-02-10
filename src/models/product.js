
module.exports = (sequelize, type) =>{
    return sequelize.define('product', {
        id:{
            type: type.STRING(50),
            primaryKey: true,
            autoIncrement: false
        },
        name:{
            type: type.STRING(120),
        },
        key_word:{
            type: type.STRING(80),
        },
        price:{
            type: type.DOUBLE,
        },
        stock:{
            type: type.SMALLINT,
        },
        img:{
            type: type.TEXT,
        }
    })
}