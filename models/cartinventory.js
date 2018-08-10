'use strict';
module.exports = (sequelize, DataTypes) => {
  
  var cartInventory = sequelize.define('cartInventory', {
    productId: {
      type: DataTypes.INTEGER,
      references: { model: 'products', key: 'id' }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    },
    isCard: DataTypes.BOOLEAN,
    isPayment: DataTypes.BOOLEAN,
    number_of_product: DataTypes.INTEGER,
    basicAmount: DataTypes.INTEGER
  }, {});

  //cartInventory.associate = function (models) {
   
  //};
  return cartInventory;
};