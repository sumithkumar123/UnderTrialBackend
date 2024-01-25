const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LawyerUsers = mongoose.model("LawyerUsers");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

router.post('/lawsetprofilepic',(req,res)=>{
    const { email, profilepic } =req.body;
    console.log("email: " ,email);
    console.log("profilepic: ",profilepic);
    LawyerUsers.findOne({email:email})
    .then(async savedUser=>{
        if(savedUser){
            savedUser.profilepic = profilepic;
            savedUser.save()
            .then(user=>{
                res.json({message:"Profile updated successfully"});
            })
            .catch(err=>{
                return res.status(422).json({error:"Server Error"});
            })

        }
        else{
            return res.status(422).json({error:"Invalid Credentials"})
        }
    })
    .catch(err =>{
        //console.log(err);
        return res.status(422).json({error:"Server Error"});
    })

})







module.exports = router;