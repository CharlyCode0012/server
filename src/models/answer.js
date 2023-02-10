module.exports = (sequelize, type) => {
  return sequelize.define("answer", {
    id: {
      type: type.STRING(50),
      primaryKey: true,
      autoIncrement: false,
    },

    question: {
      type: type.TEXT,
    },

    answer: {
      type: type.TEXT,
    },

    ans_date: {
      type: type.DATEONLY,
    },

    id_user: {
      type: type.STRING(50),
      references: {
        model: "users",
        key: "id",
      },
      onDelete: 'cascade',
    },
    

    id_product: {
      type: type.STRING(50),
      references: {
        model: "products",
        key: "id",
      },
      onDelete: 'cascade',
    },
  });
};
