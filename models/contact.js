'use strict';
module.exports = (sequelize, DataTypes) => {
  var Contact = sequelize.define('Contact', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    ReceiveName: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    ReceiveId: DataTypes.INTEGER,
    photo: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  Contact.associate = function (models) {
    Contact.belongsTo(models.User)
    Contact.hasMany(models.Message)
    Contact.belongsToMany(models.User, {through : 'Message'})
  };
  return Contact;
};