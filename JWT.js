const jwt = require('jsonwebtoken')


const createToken=(username,id)=>{
   const token = jwt.sign({id:id,username:username},"secretkeyaccess")
   return token
}

module.exports=createToken