const mongoose = require('mongoose');
// import {v4 as uuidv4} from 'uuid';
const {v4:uuidv4} = require('uuid');

const propertySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    blockchainId: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    title:{type:String,required:true},
    description:{type:String},
    location:{type:String,required:true},
    price:{type: Number,required:true},
    squareFootage:{type:Number, required:true},
    bedrooms:{type:Number,required:true},
    bathrooms:{type:Number,required:true},
    yearBuilt:{type:Number,required:true},
    status:{
        type:String,
        enum: ["Available","Under Contract","Sold"],
        default: "Available",
    },
    features:[String],
    imageUrls:[String],
},{timestamps:true});

module.exports = mongoose.model("Property",propertySchema);