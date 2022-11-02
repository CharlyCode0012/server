module.exports = (sequelize, type) => {
  return sequelize.define("order", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    folio: {
      type: type.STRING(50),
    },

    date_order: {
      type: type.DATEONLY,
    },

    total: {
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
      type: type.TINYINT,
      reference: "place_deliveries",
      referenceKey: "id",
    },

    id_payment_method: {
      type: type.TINYINT,
      reference: "payment_methods",
      referenceKey: "id",
    },
  });
};
