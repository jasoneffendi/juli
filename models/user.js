'use strict';
const generate = require('../helpers/rang')
const hash = require('../helpers/hasher')
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    salt: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        isUnique: function(value, next) {
          User.find({
              where: {email: value},
              attributes: ['id']
          })
              .done(function(error, user) {
                  if (error)
                      return next(error);
                  if (user)
                      return next('Email address already in use!');
                  next();
              });
      }
      }
    }
  }, {
    hooks: {
      beforeCreate: (data) => {
      console.log(data)
      let secret = generate()
      let hashed = hash(data.dataValues.password, secret)
      data.password = hashed
      data.salt = secret
    }, 
      beforeBulkUpdate: (data) => {
        console.log(data, 'Ini masternya')
        console.log(data.attributes, 'pertama')
        let secret = generate()
        let hashed = hash(data.attributes.password, secret)
        console.log(secret, 'ini rahasianya')
        data.attributes.password = hashed
        data.attributes.salt = secret
        console.log(data.attributes, 'halo')
      }
    },
    individualHooks: true
  });

  User.associate = function (models) {
    User.hasMany(models.Post)
    User.belongsToMany(models.Post, {through: 'commentPost'})
    // User.belongsToMany(models.Student, {through: 'SubjectStudent'});
  };

  return User;
};