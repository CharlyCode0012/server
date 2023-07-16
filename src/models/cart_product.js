module.exports = (sequelize, type) => {
    const CartProduct = sequelize.define('cart_product', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      quantity: {
        type: type.INTEGER
      },
      total_price: {
        type: type.DOUBLE
      },
      id_product: {
        type: type.STRING(50),
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      id_cart: {
        type: type.STRING(100),
        references: {
          model: 'carts',
          key: 'id'
        },
        onDelete: 'cascade'
      }
    });
  
    CartProduct.associate = (models) => {
      CartProduct.belongsTo(models.Cart, { foreignKey: 'id_cart' });
      CartProduct.belongsTo(models.Product, { foreignKey: 'id_product' });
    };
  
    return CartProduct;
  };
  