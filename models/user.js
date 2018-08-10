'use strict';
const bcrypt 			= require('bcrypt');
const bcrypt_p 			= require('bcrypt-promise');

module.exports = (sequelize, DataTypes) => {
  
  var User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull: true, unique: true, validate: { isEmail: { msg: "Phone number invalid." } } },
    password: DataTypes.STRING,
  }, {});

  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.cartInventory)
  };

  User.beforeSave(async (user, options) => {
    let err;
    if (user.changed('password')) {
      let salt, hash
      salt= await bcrypt.genSalt(10);
      hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
    }
  });

  User.prototype.comparePassword = async function (pw) {
    let err, pass
    pass  = await bcrypt_p.compare(pw, this.password);
    console.log(pass)
    if(pass)
    return this;
    else
    return 'Invalid Password';
  }

  return User;
};