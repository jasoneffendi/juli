'use strict';
module.exports = (sequelize, DataTypes) => {
  var Message = sequelize.define('Message', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    message: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    ReceiveId: DataTypes.INTEGER,
    Username: DataTypes.STRING,
    ContactId: DataTypes.INTEGER,
    photo: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  Message.associate = function (models) {
    Message.belongsTo(models.User)
  };
  return Message;
};