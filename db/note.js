const mongoose=require('mongoose');

const noteSchema=mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    content:{
        type:String,
    },
    metaData:{
        type:String,
        required:true,
    },
    active:{
        type:Boolean,
        default:true
    }
})

module.exports=mongoose.model("notes",noteSchema);