const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    profilepic:{
        type: String,
        default: '',
    },
    posts:{
        type: Array,
        default: []
    },
    followers:{
        type:Array,
        default:[]
    },
    following:{
        type:Array,
        default:[]
    },
    description:{
        type:String,
        default:'',
    },
    allmessages: {
        type: Array,
        default: []
    }
})

userSchema.pre('save', async function (next) {
    const lawuser = this;
    console.log("Just before saving before hashing  ", lawuser.password);
    if(!lawuser.isModified('password')){
        return next();
    }
    lawuser.password = await bcrypt.hash(lawuser.password, 8);
    
    console.log("Just before saving after hashing ",lawuser.password);
    next();
})
mongoose.model("LawyerUsers", userSchema);

