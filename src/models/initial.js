module.exports = (sequelize, type) => {
  return sequelize.define("initial", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    option_key: {
      type: type.STRING(50),
      references: {
        model:'responses',
        key: 'option_key'
    },
    onDelete: 'cascade',
    },

    title: {
      type: type.STRING(50),
    },

    keyWords: {
      type: type.STRING(300),
    },
  });
};
