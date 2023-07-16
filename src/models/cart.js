module.exports = (sequelize, type) => {
    const Cart = sequelize.define('cart', {
      id: {
        type: type.STRING(100),
        primaryKey: true,
        autoIncrement: false
      },
      id_client: {
        type: type.STRING(20),
        references: {
          model: 'clients',
          key: 'number'
        },
        onDelete: 'cascade'
      },
      total_price: {
        type: type.DOUBLE
      }
    });
  
    Cart.associate = (models) => {
      Cart.hasMany(models.CartProduct, { foreignKey: 'id_cart' });
    };
  
    return Cart;
  };
  