'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comment = sequelize.define('Comment', {
    comment: DataTypes.STRING,
    UserId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  Comment.associate = function (models) {
    Comment.belongsToMany(models.Post, {through: 'commentPost'})
  };
  return Comment;
};