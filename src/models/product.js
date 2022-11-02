
module.exports = (sequelize, type) =>{
    return sequelize.define('product', {
        id:{
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
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