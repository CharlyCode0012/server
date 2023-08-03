module.exports = (sequelize, type) => {
  return sequelize.define("menu", {
    id: {
      type: type.STRING(50),
      primaryKey: true,
      autoIncrement: false,
    },

    title: {
      type: type.STRING(50),
    },

    answer: {
      type: type.STRING(300),
    },

    principalMenu: {
      type: type.BOOLEAN,
    },
  });
};
