
const { cartInventory }  = require('../models');
const { Product }  = require('../models');

const addCard = async function(req, res){
    const body = req.body;
    let err, user;
    let payload = {
        productId : '2',
        userId : '1',
        number_of_product : '1',
        basicAmount : '200'
    }
   try{
        result = await cartInventory.create(payload);
        res.json({success:true, data: result});

    }catch(e){
        res.json({success:false, error: err});
    } 
}


module.exports.addCard = addCard;


const CartList = async function(req, res){
    const body = req.body;
    let err, user;
    let payload = {
         userId : '1',
    }
//    try{
        result = await Product.findAll({
            include: [{
              model: cartInventory,
             }]
          });
        res.json({success:true, data: result});

    // }catch(e){
    //     res.json({success:false, error: err});
    // } 
}

module.exports.CartList = CartList;