const mongoose=require("mongoose");
const tagschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:Stirng,
        required:true
    },
    course:{
        type:mongoose.Schema.types.ObjectId,
        ref:"Course"
    }
})
module.exports=mongoose.model("tag",tagschema);