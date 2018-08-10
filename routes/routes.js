const express = require('express');
const router  = express.Router();
const UserController 	= require('../controllers/user.controller');
const productController 	= require('../controllers/product.controller');
const cartController 	= require('../controllers/cart.controller');

router.get('/', function(req, res){
	res.statusCode = 200;//send the appropriate status code
	res.json({status:"success", message:"Server is working"})
});

router.post('/createUser', UserController.createUser);    
router.post('/loginUser', UserController.loginUser);   
router.get('/Userinfo/:_id', UserController.Userinfo);    

router.get('/getProducts', productController.productList);    
router.post('/addCard', cartController.addCard);   
router.get('/getCartList', cartController.CartList);   
 

  


module.exports = router;