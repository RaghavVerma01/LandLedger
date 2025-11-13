const connectToMongo = require('./db');
let cors = require('cors');
const express = require('express');
// import dotenv from 'dotenv';
const dotenv=require('dotenv');

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({limit:'10mb',extended:true}));

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/property',require('./routes/property'));


// Connect to MongoDB
connectToMongo();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
});
