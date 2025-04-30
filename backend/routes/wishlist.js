const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Wishlist = require('../models/Wishlist');
const { body, validationResult } = require('express-validator');

router.get('/fetchWishlist', fetchuser, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user.id });
    res.json(wishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  '/addWishlist',
  fetchuser,
  [
    body('id').isInt().withMessage('Property ID must be a number'),
    body('name').notEmpty().withMessage('Property name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('price').notEmpty().withMessage('Price is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('size').notEmpty().withMessage('Size is required'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative number'),
    body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
  ],
  async (req, res) => {
    console.log('request body: ', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, name, location, price, type, size, bedrooms, bathrooms } = req.body;

    try {
      // Check if already in wishlist
      const existing = await Wishlist.findOne({
        userId: req.user.id,
        'property.id': id,
      });

      if (existing) {
        return res.status(409).json({ error: 'Property is already in wishlist' });
      }

      // Create wishlist entry
      const newItem = new Wishlist({
        userId: req.user.id,
        property: {
          id,
          name,
          location,
          price,
          type,
          size,
          bedrooms,
          bathrooms,
        },
      });

      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (error) {
      console.error('Error adding to wishlist:', error.message);
      res.status(500).send('Internal Server Error');
    }
  }
);

module.exports = router;
