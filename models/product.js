'use strict';
module.exports = (sequelize, DataTypes) => {
  var Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    discription: DataTypes.STRING,
    image: DataTypes.STRING
  }, {});

  Product.associate = function(models) {
    // Product.hasMany(models.cartInventory)
  };
  return Product;
};
