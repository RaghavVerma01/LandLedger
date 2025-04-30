const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add a Name'],
        
    },
    username:{
        type:String,
        required:[true,'Please add a Username'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'Please add a Password'],
        
    },
    date:{
        type:Date,
        default: Date.now
    }

})



module.exports = mongoose.model('user',userSchema)