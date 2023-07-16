module.exports = (sequelize, type) => {
    const Product = sequelize.define('product', {
      id: {
        type: type.STRING(50),
        primaryKey: true,
        autoIncrement: false
      },
      product_name: {
        type: type.STRING(120)
      },
      description: {
        type: type.STRING(200)
      },
      key_word: {
        type: type.STRING(80)
      },
      price: {
        type: type.DOUBLE
      },
      stock: {
        type: type.SMALLINT
      },
      img: {
        type: type.TEXT
      }
    });
  
    return Product;
  };
  