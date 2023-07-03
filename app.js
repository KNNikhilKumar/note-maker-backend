const express=require('express');
require('./db/config');
const User=require('./db/user');
const Note=require('./db/note');
const app=express();
const cors=require('cors');
app.use(express.json());
app.use(cors());
app.listen(8000,()=>console.log('server started'));

app.post('/register',async (req,res)=>
{
    try
    {
        console.log(req.body);
        const already=await User.findOne({email:req.body.email});

        if(already==null)
        {
            const user=new User(req.body);
            const resp=await user.save();
            res.status(200).send(req.body);
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
        console.log(req.body);
        const user=await User.findOne(req.body);
        console.log(req.body,user);
        if(user!=null&&req.body.email&&req.body.password)
        {
            console.log("inside if")
            res.status(200).json(req.body);
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

app.post("/newnote",async (req,res)=>{
    try{
        const date=new Date();
        const newnote=new Note({...req.body,metaData:`{date:${date.toDateString()},time:${date.toTimeString()}}`});
        const resp=await newnote.save();
        res.status(200).json(resp);
    }   
    catch(e)
    {
        console.log(e);
        res.status(500).json({message:'server side error'});
    }
})

app.put("/edit",async (req,res)=>{
    try{
        const date=new Date();
        const updatednote={...req.body,metaData:`{date:${date.toDateString()},time:${date.toTimeString()}}`};
        const resp= await Note.findOneAndUpdate({_id:req.body._id,email:req.body.email},updatednote);
        if(resp!=null)
        {
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

app.delete("/delete",async (req,res)=>{
    try{
    const resp= await Note.findOneAndUpdate({_id:req.body._id,email:req.body.email,active:true},{active:false});
        if(resp!=null)
        {
            res.status(200).json({...resp,"message":"note updated successfully"});
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

app.get("/notes",async (req,res)=>{
   // console.log(req.header["accessToken"]);
    //decrypt access token
    //fetch recoreds from db
    const notes=await Note.find({email:req.query.user,active:true});
    res.status(200).json(notes);
    //res.send({...req.query,...req.headers});
})

app.get('/',async (req,res)=>{
    const records=await User.find({});
    console.log(records);
    res.send(records);
})