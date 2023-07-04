require('dotenv').config();
const express=require('express');
require('./db/config');
const User=require('./db/user');
const Note=require('./db/note');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

const ENC_KEY=process.env.ENC_KEY;

const app=express();
const cors=require('cors');
const { connection } = require('mongoose');
app.use(express.json());
app.use(cors());
app.listen(process.env.PORT||8000,()=>console.log('server started'));

app.post('/register',async (req,res)=>
{
    try
    {
        console.log(req.body);
        const already=await User.findOne({email:req.body.email});

        if(already==null)
        {
            const salt=await bcrypt.genSalt(10);
            const secPass=await bcrypt.hash(req.body.password,salt);
            console.log(secPass);
            const user=new User({...req.body,password:secPass});
            const resp=await user.save();
            const userData={...req.body,password:secPass};
            delete userData.password;
            const encData=userData.email;
            jwt.sign({encData},ENC_KEY,(err,token)=>{
                if(err)
                {
                    res.status(500).json({"message":"server side error !!!"});
                    
                }
                else
                {
                    res.status(200).json({...userData,accessToken:token});
                }
            })
        }
        else
        {
             res.status(402).json({message:'user already present'});
        }
       
    }
    catch(e)
    {
        console.log(e);
        res.status(500).json({message:'server side error'});
    }
    
})

app.post('/login',async (req,res)=>{
    try{
       // console.log(req.body);
        // const salt=await bcrypt.genSalt(10);
        // const secPass=await bcrypt.hash(req.body.password,salt);
        // console.log('login',secPass);
        const user=await User.findOne({email:req.body.email});
        //console.log(req.body,user);
        if(user!=null&&req.body.email&&req.body.password)
        {
            const verify=await bcrypt.compare(req.body.password,user.password);
            if(verify)
            {
                console.log("inside if")
                const userData={...req.body};
                delete userData.password;
                const encData=userData.email;
                jwt.sign({encData},ENC_KEY,(err,token)=>{
                    if(err)
                    {
                        res.status(500).json({"message":"server side error !!!"});
                    }
                    else
                    {
                        console.log("accessToken",token);
                        res.status(200).json({...userData,accessToken:token});
                    }
                })
            }
            else
            {
                 res.status(401).json({'message':'invalid credentials'});
            }
           
        }
        else{
        res.status(401).json({'message':'invalid credentials'});
        }
    }
    catch(e)
    {
        console.log(e);
        res.status(500).json({message:'server side error'});
    }
})

app.post("/newnote",verifyAccessToken,async (req,res)=>{
    try{
        console.log("inside post");
        const date=new Date();
        const newnote=new Note({...req.body,metaData:`{date:${date.toDateString()},time:${date.toTimeString()}}`});
        const resp=await newnote.save();
        console.log("new note accessToken",req.headers.accesstoken);
        res.status(200).json(resp);
    }   
    catch(e)
    {
        console.log(e);
        res.status(500).json({message:'server side error'});
    }
})

app.put("/edit",verifyAccessToken,async (req,res)=>{
    try{
        const date=new Date();
        // console.log("put body",req.body);
        // console.log("headers",req.headers);
        const updatednote={...req.body,metaData:`{date:${date.toDateString()},time:${date.toTimeString()}}`};
        const resp= await Note.findOneAndUpdate({_id:req.headers._id,email:req.headers.email},updatednote);
        console.log("edit accessToken",req.headers.accesstoken);
        if(resp!=null)
        {
            console.log("note updated");
            res.status(200).json({"message":"note updated successfully"});
        }
        else
        {
            res.status(400).json({"message":"invalid request"});
        }
    }
    catch(e)
    {
        console.log(e);
        res.status(500).json({messgae:"server side error"});
    }
})


app.get("/notes",verifyAccessToken,async (req,res)=>{
   // console.log(req.header["accessToken"]);
    //decrypt access token
    //fetch recoreds from db
    try
    {
        const notes=await Note.find({email:req.query.user,active:true});
        console.log("notes accessToken",req.headers.accesstoken);
        res.status(200).json(notes);
    }
    catch(e)
    {
        res.status(500).json({"message":"server side error"});
    }
   
    //res.send({...req.query,...req.headers});
})

app.delete("/delete",verifyAccessToken,async (req,res)=>{

     // console.log(req.header["accessToken"]);
    //decrypt access token
    try{
        const resp= await Note.findOneAndUpdate({_id:req.headers._id,email:req.headers.email,active:true},{active:false});
        console.log("delete accessToken",req.headers.accesstoken);
            if(resp!=null)
            {
                res.status(200).json({"message":"note deleted successfully"});
            }
            else{
                res.status(400).json({"message":"invalid request"});
            }
        }
        catch(e)
        {
            console.log(e);
        }

})

async function verifyAccessToken(req,res,next){

        const jwtv=await jwt.decode(req.headers.accesstoken);
        console.log("jwtv",jwtv);
        if(jwtv!=null&&jwtv.encData&&jwtv.encData==req.headers.email)
        {
            console.log("inside next");
            next();
        }
        else
        {
            res.json(420).json({"message":"wrong attempt"});
        }
}

app.get('/',async (req,res)=>{
    const records=await User.find({});
    console.log(records);
    res.send(records);
})