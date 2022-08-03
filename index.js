const express=require('express')
const mongoose=require('mongoose')
const User=require('./Models')
const cors =require('cors')
const path=require('path')
const bcrypt=require('bcrypt')
const http=require('http')
const cookieParser=require('cookie-parser')
const dotenv=require('dotenv').config()
const app=express()
const jwt=require('jsonwebtoken')
app.use(cors())
app.use(express.json())
app.use(cookieParser())
const createToken = require('./JWT')
const server=http.createServer(app)
const {Server} = require('socket.io')

const io= new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methodes:["GET","POST"],
    }
})

io.on("connection",(socket)=>{
    socket.on('join_room',(data)=>{
        socket.join(data.room)
     
    })
    
    socket.on('send',(data)=>{
        socket.to(data.room).emit('receive',data)
    })
})

mongoose.connect(process.env.URI,()=>{
    console.log('database connected ...')
})



app.post('/register',(req,res)=>{
    const username=req.body.username
    const email=req.body.email
    
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if(err){res.send({message:'error registring new user'})}
        
        else{
            User.findOne({username:username},(err,result)=>{
                if(err){
                    res.send({message:"error"})
                    console.log(err)
                }else if(result){
                    res.send({message:"username already taken"})
                }
                else if(username==""||req.body.password==""){
                    res.send({message:"please enter a valid username or password"})
                }
                else{
                    newuser=new User({
                        username,
                        email,
                        password:hash,
                    })
                    newuser.save()
                    res.send({message:"you are signed up now "})
                }
                
            })
        }
   })
    
   

})
app.post('/login',(req,res)=>{
    const username=req.body.username
    const password=req.body.password

    User.findOne({username},(err,obj)=>{
        if(err){
            console.log(err)
           
        }else if(!obj){
            console.log('username does not exist')
            res.send({message:"please enter a valid username and password",state:false})
        }
        else{
            bcrypt.compare(password,obj.password,(err,result)=>{
                if(err){
                    res.send({message:'please retry'})
                }
                else if(result){
                    const token = createToken(username,result._id)
                    return res.status(200).send({token:token,username:username,state:true,id:obj._id})
                }
                else(!result)
                    res.send({message:"incorrect username or password",state:false})
            })
        }
        
    })
    

})
app.post('/check',(req,res)=>{
    const token=req.body.token
    const username=req.body.username
   if(username){
    jwt.verify(token,'secretkeyaccess',(err,result)=>{
        if(result.username==username){
            res.send({state:true})
        }else{
            res.send({state:false})
        }
    })
   }else{res.send({state:false})}
})
app.post('/search',(req,res)=>{
    User.find((err,result)=>{
        if(err){
            res.send(err)
        }else{
            res.send(result)
        }
    })
    
})
app.post('/addfriend',(req,res)=>{
    const username=req.body.username
    const id=req.body.id
    var friendList={
        friendId:id
    }
    User.findOneAndUpdate({username:username},{$push:{friendList:friendList}},{upsert:true},(err,data)=>{
        if(err){res.send(err)}else{res.send(data);console.log(data)}
    })
})
app.post('/friendlist',(req,res)=>{
    const username=req.body.username
    User.findOne({username:username},(err,result)=>{
        if(err){res.send(err)}
        else{res.send(result.friendList)}
    })
})
app.post('/friendbyid',(req,res)=>{
    const id=req.body.id
    User.findById(id,(err,result)=>{
        res.send(result)
       
    })
})
app.get('/allfriend',(req,res)=>{
    User.find((result,err)=>{
        if(err){res.send(err)}else{
            res.send(result)
        }
    })
})
app.get('/',(req,res)=>{
    res.send('hello')
})
server.listen(process.env.PORT||3001,()=>{console.log('app running')})