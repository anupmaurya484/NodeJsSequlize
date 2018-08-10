const { Product }  = require('../models');

const productList = async function(req, res){
    let err, user;
   try{
        result = await Product.findAll();
        
        if(!result) res.json({success:false, error: 'Not registered'}); 
        
        res.json({success:true, data: result});

    }catch(e){
        res.json({success:false, error: e});
    } 
}

module.exports.productList = productList;