const express = require('express');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser')
const { default: mongoose } = require('mongoose');
const { body, validationResult } = require('express-validator');
const {Schema} = mongoose;
const bcrypt = require('bcrypt');
const router = express.Router()
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET; // Use .env secret

//ROUTE 1: Creating user using : POST "/api/auth/createuser"
router.post('/createuser',[
   body('name').isLength({min:3}),
   body('username').notEmpty(),
   body('password').isLength({min:8})
], async(req,res)=>{
   const result = validationResult(req);
   const salt = await bcrypt.genSalt(10)
   const saltedPass = await bcrypt.hash(req.body.password,salt)
   if (result.isEmpty()) {
      let user = await User.findOne({username:req.body.username})
      if(user){
         return res.status(400).json({error: "Username already exists"})
      }else{
         user = await User.create({
            name:req.body.name,
            username: req.body.username,
            password: saltedPass});

            const data = {
               user:{
                  id:user.id
               }
            }
            const authToken = jwt.sign(data,JWT_SECRET)
            console.log(authToken)
            // res.json(user)
            res.json({authToken})
      }
      
   }
 else{

    return res.send({ errors: result.array() });
}
 });


//ROUTE 2: Authenticate a user using : POST "/api/auth/login". no login required

router.post('/login',[
   body('username').exists().withMessage('Username is required.'),
   body('password').exists().withMessage('Password cannot be empty').isLength({min:8}).withMessage('Password should be atleast 8 characters')
], async(req,res)=>{
   const result = validationResult(req);
   if (!result.isEmpty()) {
      return res.status(400).json({errors:result.array()})
   }
   const {username,password} = req.body;
   try {
      let user = await User.findOne({username})
      if(!user){
         return res.status(400).json({error: "Enter Correct Credentials."})

      }
      const passwordCompare = await bcrypt.compare(password,user.password);
      if(!passwordCompare){
         return res.status(400).json({error: "Enter Correct Credentials."})
      }
      const data = {
         user:{
            id:user.id
         }
      }
      const authToken = jwt.sign(data,JWT_SECRET);
      res.json({authToken});

   } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
   }

})

// ROUTE 3: Get logged in User details using : POST "/api/auth/getuser". Login Required
router.post('/getuser', fetchuser, async (req, res) => {
   try {
       const userID = req.user.id;
       const user = await User.findById(userID).select("-password");
       res.json(user);
   } catch (error) {
       console.error(error.message);
       res.status(500).send("Internal Server Error");
   }
});


module.exports = router

