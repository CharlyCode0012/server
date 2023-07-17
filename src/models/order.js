module.exports = (sequelize, type) => {
  const Order = sequelize.define("order", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    folio: {
      type: type.STRING(50),
    },

    date_order: {
      type: type.DATEONLY
    },
    date_delivery: {
      type: type.DATEONLY
    },
    total: {
      type: type.DOUBLE,
    },

    amount: {
      type: type.DOUBLE,
    },


    state: {
      type: type.ENUM("Pagado", "Abonado", "NA"),
    },

    id_client: {
      type: type.STRING(20),
      reference: "clients",
      referenceKey: "number",
    },

    id_place: {
      type: type.STRING(50),
      reference: "place_deliveries",
      referenceKey: "id",
    },

    id_payment_method: {
      type: type.STRING(50),
      reference: "payment_methods",
      referenceKey: "id",
    },
  });
  Order.associate = (models) => {
    Order.hasMany(models.OrderDetails, { foreignKey: 'id_order' });
  };

  return Order;
};
