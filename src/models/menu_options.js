module.exports = (sequelize, type) =>{
  return sequelize.define('menu_options', {
      id:{
          type: type.STRING(50),
          primaryKey: true,
          autoIncrement: false
      },

      index: {
          type: type.INTEGER,
          allowNull: false
      },

      brief:{
          type: type.STRING(200),
          allowNull: false
      },

      description:{
          type: type.STRING(200),
          allowNull: true
      },

      keywords:{
          type: type.STRING(100),
          allowNull: false
      },

      menu:{
          type: type.STRING(50),
          references: {
              model: 'menus',
              key: 'id'
          },
          onDelete: 'cascade',
          allowNull: false
      },

      action_type:{
          type: type.ENUM('menu', 'catalog', 'link', 'message'),
          allowNull: false
      }
  })
}