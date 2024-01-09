const express = require('express');
const User = require('../models/User');
const router = express.Router();
const {body, validationResult } = require('express-validator'); // Using express-validator for validations.
const bcrypt = require('bcryptjs'); // Importing bcrypt
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'BrownieIsNtingle'; // JWT secret used for building JWT token

// Route 1 : User using : POST "/api/auth". Does not require Authentication / login
router.post('/createuser',[
    body('name','Enter a Valid Name').isLength({min:3}),
    body('email','Enter a Valid Email').isEmail(),
    body('password','Please Enter a valid password of at least 5 char length').isLength({min:5})
],async (req,res)=>{

    // If there are errors, return bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        
        // Checking if the user exists and raising issue    
        let user =  await User.findOne({email : req.body.email});
        if (user) {
            return res.status(400).json({error : "Sorry a user with this email already exists"});
        }

        // Creating salt which is added with the password to make hash that is stored in the DB.
        const salt = await bcrypt.genSalt(10);

        // using bcrypt to convert the password and salt to hash value
        const secPass = await bcrypt.hash(req.body.password,salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        // This data variable contains the id (mongodb record id) of the user 
        const data = {
            user: {
                id:user.id
            }
        }
        // Creating the jwt authentication token
        const authtoken = jwt.sign(data,JWT_SECRET);

        
        res.send(authtoken); // Sending jwt authentication token as response
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occured !!");
    }
})

// Route 2 :  Create a User using : POST "/api/auth/login". Does not require Authentication / login
router.post('/login',[
    body('email','Enter a Valid Email').isEmail(),
    body('password','password Cannot be blank').exists()
],async (req,res)=>{
    try {
    // If there are errors, return bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    // const email = req.body.email;
    // const password = req.body.password;

    const {email,password} = req.body;

      // Checking if the user exists and raising issue    
      let user =  await User.findOne({email});
      if (!user) {
          return res.status(400).json({error : "Please Provide Valid Credentials !!"});
        }
        
        const passwordCompare = await bcrypt.compare(password,user.password);
        
        if (!passwordCompare){
            
            return res.status(400).json({error : "Please Provide Valid Credentials !!"});
        }
        const data = {
            user: {
                id:user.id
            }
        }
        // Creating the jwt authentication token
        const authtoken = jwt.sign(data,JWT_SECRET);

        
        res.send(authtoken); // Sending jwt authentication token as response
    
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error !!");
    }

});

// Route 3 :  Create a User using : POST "/api/auth/login". Does not require Authentication / getuser

router.post('/getuser',fetchuser,async (req,res)=>{

    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error !!");
    }
})

module.exports = router