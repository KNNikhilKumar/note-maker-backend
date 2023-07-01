const express=require('express');
require('./db/config');
const User=require('./db/user');
const app=express();
const cors=require('cors');
app.use(express.json());
app.use(cors());
app.listen(8000,()=>console.log('server started'));

app.post('/register',(req,res)=>
{
    try
    {
        console.log(req.body);
        const user=new User(req.body);
        const resp=user.save();
    }
    catch(e)
    {
        console.log(e);
        res.status(500).json({message:'server side error'});
    }
    
})

app.get('/',async (req,res)=>{
    const records=await User.find({});
    console.log(records);
    res.send(records);
})