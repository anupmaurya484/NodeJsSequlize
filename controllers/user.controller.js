const { User }  = require('../models');


const createUser = async function(req, res){
    const body = req.body;
    let err, user;
    let payload = {
        firstName : 'anup',
        lastName : 'mourya',
        email : 'mourya8@gmail.com',
        password : '123456'
    }
   try{
        result = await User.create(payload);
        res.json({success:true, data: result});

    }catch(e){
        res.json({success:false, error: err});
    } 
}

module.exports.createUser = createUser;

const loginUser = async function(req, res){
    const body = req.body;
    let err, user;
    let payload = {
        email : 'mourya8@gmail.com',
        password : '123456'
    }
   try{
        result = await User.findOne({where:{email:payload.email}});
        if(!result) res.json({success:false, error: 'Not registered'}); 

        result =  await result.comparePassword(payload.password)
        
        res.json({success:true, data: result});

    }catch(e){
        res.json({success:false, error: e});
    } 
}

module.exports.loginUser = loginUser;


const Userinfo = async function(req, res){
    const userId = req.params._id;
    let err, user;
   try{
        result = await User.findOne({where:{id:userId}});
        
        if(!result) res.json({success:false, error: 'Not registered'}); 
        
        res.json({success:true, data: result});

    }catch(e){
        res.json({success:false, error: e});
    } 
}

module.exports.Userinfo = Userinfo;