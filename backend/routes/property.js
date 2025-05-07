const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Property = require('../models/Property');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');


router.get('/fetchProperty', fetchuser, async (req, res) => {
  try {
    const property = await Property.find()
    .populate('userId', 'name username walletAddress').lean()

    const properties = property.map((p)=>{
      const{userId,...rest} = p
      return {
        ...rest,
        seller:userId
      }
    })

    // const formattedProperties = properties.map((property)=>{
    //   const{userId, ...rest} = property;
    //     return {
    //       ...rest,
    //       seller:userId,
    //     }
    // })
    res.json(properties);
  } catch (error) {
    console.log(error);
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
          blockchainId,
          features,
          imageUrl
        } = req.body;
        // console.log("Token ID is: ",tokenId)
        const newProperty = new Property({
          userId: req.user.id,
          title,
          description,
          location,
          price,
          squareFootage,
          bedrooms,
          bathrooms,
          yearBuilt,
          status,
          blockchainId,
          features,
          imageUrl
        });
  
        const saved = await newProperty.save();
        res.status(201).json(saved);
      } catch (err) {
        console.error('Error saving property:', err.message);
        res.status(500).send('Internal Server Error');
      }
    }
  );
  // router.post("/properties", async (req, res) => {
  //   try {
  //     const {
  //       title,
  //       description,
  //       location,
  //       price,
  //       squareFootage,
  //       bedrooms,
  //       bathrooms,
  //       yearBuilt,
  //       status,
  //       tokenId,
  //       wallet,
  //       features,
  //       imageUrl
  //     } = req.body;
  
  //     const newProperty = new Property({
  //       title,
  //       description,
  //       location,
  //       price,
  //       squareFootage,
  //       bedrooms,
  //       bathrooms,
  //       yearBuilt,
  //       status,
  //       tokenId,
  //       wallet,
  //       features,
  //       imageUrl
  //     });
  
  //     await newProperty.save();
  
  //     res.status(201).json({ message: "Property saved successfully." });
  //   } catch (error) {
  //     console.error("❌ Error saving property:", error);
  //     res.status(500).json({ message: "Server error." });
  //   }
  // });

  router.delete('/delete/:id', fetchuser, async (req, res) => {
    try {
      const propertyId = req.params.id;
  
      // Optional: restrict deletion only to properties owned by the user
      // const property = await Property.findOneAndDelete({ _id: propertyId, userId: req.user.id });
  
      const property = await Property.findByIdAndDelete(propertyId);
  
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
  
      res.json({ message: "Property deleted successfully", deletedProperty: property });
    } catch (error) {
      console.error("❌ Error deleting property:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
   
module.exports = router;
