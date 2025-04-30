const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Property = require('../models/Property');
const { body, validationResult } = require('express-validator');


router.get('/fetchProperty', fetchuser, async (req, res) => {
  try {
    const property = await Property.find();
    res.json(property);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
    '/addProperty',
    fetchuser,
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('location').notEmpty().withMessage('Location is required'),
      body('price').isNumeric().withMessage('Price must be a number'),
      body('squareFootage').isNumeric().withMessage('Square footage must be a number'),
      body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative number'),
      body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
      body('yearBuilt').isInt({ min: 1000 }).withMessage('Valid year is required'),
      body('status').optional().isIn(["Available", "Under Contract", "Sold"]).withMessage('Invalid status'),
      body('features').optional().isArray().withMessage('Features must be an array of strings'),
      body('imageUrls').optional().isArray().withMessage('Image URLs must be an array of strings'),
    ],
    async (req, res) => {
      console.log('Request body:', req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const {
          title,
          description,
          location,
          price,
          squareFootage,
          bedrooms,
          bathrooms,
          yearBuilt,
          status,
          features,
          imageUrls
        } = req.body;
  
        const newProperty = new Property({
        //   userId: req.user.id,
         userId: '661e9d68bc2f8a28ec6a1c2b',
          title,
          description,
          location,
          price,
          squareFootage,
          bedrooms,
          bathrooms,
          yearBuilt,
          status,
          features,
          imageUrls
        });
  
        const saved = await newProperty.save();
        res.status(201).json(saved);
      } catch (err) {
        console.error('Error saving property:', err.message);
        res.status(500).send('Internal Server Error');
      }
    }
  );
  router.post("/properties", async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        price,
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        status,
        tokenId,
        wallet,
        features,
        imageUrl
      } = req.body;
  
      const newProperty = new Property({
        title,
        description,
        location,
        price,
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        status,
        tokenId,
        wallet,
        features,
        imageUrl
      });
  
      await newProperty.save();
  
      res.status(201).json({ message: "Property saved successfully." });
    } catch (error) {
      console.error("❌ Error saving property:", error);
      res.status(500).json({ message: "Server error." });
    }
  });
  
  
module.exports = router;









// const express = require('express')
// const router = express.Router();
// // import Property from '../models/Property';
// // const User = require('../models/User');
// const fetchuser = require('../middleware/fetchuser');
// const Property = require('../models/Property');




// router.post('/properties',fetchuser,async(req,res)=>{
//     try{
//         const{
//             title,
//             description,
//             location,
//             price,
//             squareFootage,
//             bedrooms,   
//             bathrooms,
//             yearBuilt,
//             status,
//             features,
//             imageUrls,
//         } = req.body;

//         const newProperty = new Property({
//             userId: req.user.id,
//             title,
//             description,
//             location,
//             price,
//             squareFootage,
//             bedrooms,
//             bathrooms,
//             yearBuilt,
//             status,
//             features,
//             imageUrls,
//         });

//         await newProperty.save();
//         res.status(201).json(newProperty);
//     }catch(err){
//         console.error(err);
//         res.status(500).json({error:"Failed to create property"});
//     }
// });

// module.exports = router;