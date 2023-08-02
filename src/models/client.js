module.exports = (sequelize, type) => {
  const Client = sequelize.define("client", {
    id: {
      type: type.INTEGER,
      unique: true,
    },

    number: {
      type: type.STRING(20),
      primaryKey: true,
      autoIncrement: false,
    },

    purcharses: {
      type: type.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });

  Client.beforeCreate((client, options) => {
    return Client.max('id').then((maxId) => {
      client.id = (maxId || 0) + 1;
    });
  });

  return Client;
};
