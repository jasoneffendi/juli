'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    photo: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    Price: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  Post.associate = function (models) {
    Post.belongsTo(models.User)
    Post.hasMany(models.commentPost)
    Post.belongsToMany(models.User, {through: 'commentPost'})
  };
  return Post;
};