'use strict';
module.exports = (sequelize, DataTypes) => {
  var commentPost = sequelize.define('commentPost', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    PostId: DataTypes.INTEGER,
    CommentId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    Price: DataTypes.INTEGER,
    comment: DataTypes.STRING,
    Username: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  commentPost.associate = function (models) {
    commentPost.belongsTo(models.User)
    commentPost.belongsTo(models.Comment)
  };

  return commentPost;
};