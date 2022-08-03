const mongoose = require('mongoose')
const friendschema=new mongoose.Schema({
    friendId:String,
})
const userschema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    friendList:[friendschema]
})

const User=mongoose.model('User',userschema)
module.exports=User
