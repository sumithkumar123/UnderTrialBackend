const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LawyerUsers = mongoose.model("LawyerUsers");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");



// router.get('/home',(req,res)=>{
//     res.send("Hello World!!");
// })
async function mailer(recieveremail, code){
    //console.log("mailer function called");
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,//true for 465,false for other ports
        requireTLS: true,
        auth: {
            user: process.env.NodeMailer_email,
            pass: process.env.NodeMailer_password,
        },
    });
    let info = await transporter.sendMail({
        from: "UnderTrial",
        to: `${recieveremail}`,
        subject: "Email Verification",
        text: `Your Verification Code is ${code}`,
        html: `<b>Your Verification Code is ${code}</b>`,
    })
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

router.post('/lawverify', (req,res) => {
    //console.log(req.body);
    console.log('sent by client', req.body);
    const {email} =req.body;
    if(!email){
        return res.status(422).json({error: "Please add all the fields"});
    }
                    // const savedUser =await LawyerUsers.findOne({email: email});

        LawyerUsers.findOne({ email: email})
        .then(async (savedUser) => {
            //console.log(savedUser);
            //return res.status(422).json({message: "Email sent"});
            if(savedUser){
                return res.status(422).json({error: "Invalid Credentials"});
            }
            try{
                let VerificationCode = Math.floor(100000 + Math.random()*900000);
                await mailer(email, VerificationCode);
                console.log("Verification Code", VerificationCode);
                res.send({message: "Verification Code sent to your Email", VerificationCode, email});

            }
            catch(err){ 
                console.log(err);
            }
            
        })
        //return res.status(422).json({message: "Email sent"});
        //ylcz xiay umoy jnsk
    }
)

router.post('/lawchangeusername', (req,res) => {
    const { username, email } = req.body;

    LawyerUsers.find({username}).then(async (savedUser) => {
        if(savedUser.length > 0){
            return res.status(422).json({error: "Username already exists"});
        }
        else{
            return res.status(200).json({message: "Username Available", username, email})
        }
    })
})

router.post('/lawsignup', async (req,res) => {
    const { username, password, email } = req.body;
    if(!username || !password || !email){
        return res.status(422).json({ error: "Please add all the fields" });
    }
    else {
        const user = new LawyerUsers({
            username,
            email,
            password,

        })

        try{
            await user.save();
            const token = jwt.sign({ _id : user._id}, process.env.JWT_SECRET);
            return res.status(200).json({message: "LawyerUsers Registered Successfully", token});
        }
        catch(err){
            console.log(err);
            return res.status(422).json({error: "LawyerUsers Not Registered"});
        }
    }
})

//forgot password(fp)
router.post('/lawverifyfp', (req,res) => {
    //console.log(req.body);
    console.log('sent by client', req.body);
    const {email} =req.body;
    if(!email){
        return res.status(422).json({error: "Please add all the fields"});
    }
                    // const savedUser =await LawyerUsers.findOne({email: email});

        LawyerUsers.findOne({ email: email})
        .then(async (savedUser) => {
            //console.log(savedUser);
            //return res.status(422).json({message: "Email sent"});
            if(savedUser){
                try{
                    let VerificationCode = Math.floor(100000 + Math.random()*900000);
                    await mailer(email, VerificationCode);
                    console.log("Verification Code", VerificationCode);
                    res.send({message: "Verification Code sent to your Email", VerificationCode, email});
    
                }
                catch(err){ 
                    console.log(err);
                }
            }
            else{
                return res.status(422).json({error: "Invalid Credentials"});

            }
           
            
        })
        //return res.status(422).json({message: "Email sent"});
        //ylcz xiay umoy jnsk
    }
)
//reset password
router.post('/lawresetpassword',(req,res)=>{
    const {email, password }= req.body;
    if(!email || !password){
        return res.status(422).json({error:"Please add all the fields"});
    }
    else{
        LawyerUsers.findOne({ email: email })
        .then(async(savedUser)=>{
            if(savedUser){
                savedUser.password = password;
                savedUser.save()
                .then(user => {
                    res.json({message:"Password Changed Successfully"});
                })
                .catch(err => {
                    console.log(err);
                })

            }
            else{
                return res.status(422).json({error:"Invalid Credentials"});
            }
        })
    }


})
//login
router.post('/lawsignin',(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(422).json({error: "Please add all the fields"});
    }
    else{
        LawyerUsers.findOne({email: email})
        .then(savedUser => {
            if(!savedUser){
                return res.status(422).json({error:"Invalid Credentials"});
            }
            else{
                console.log(savedUser);
                bcrypt.compare(password, savedUser.password)
                .then(
                    doMatch =>{
                        if(doMatch){
                            const token = jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET);
                            const {_id, username, email}= savedUser;

                            res.json({message:"Successfully Signed In",token,user:{_id,username,email}});

                        }
                        else{
                            return res.status(422).json({error :"Invalid credentials" });
                        }
                    }
                )
                // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NThkYzViOWZkNTQxZWI4ZjBhMDBmYmQiLCJpYXQiOjE3MDQwMTE0Njl9.NMT_rOxApm_0BXx8FxaUSo30yM5YO7V8JfuuO9WBdjE"
                //res.status(200).json({message:"LawyerUsers Logged In Successfully",savedUser});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }
})
//userdata
// router.post('/userdata',(req,res)=>{
//     const {email} =req.body;
//     LawyerUsers.findOne({email:email})
//     .then(savedUser=>{
//         if(!savedUser){
//             return res.status(422).json({error:"Invalid Credentials"});
//         }
//         else{
//             console.log(savedUser);
//             res.status(200).json({message:"LawyerUsers Found",user: savedUser})
//         }
//     })
// })
router.post('/lawuserdata',(req,res)=>{
    const {authorization}=req.headers;
    //authorization = "Bearer afasg"
    if(!authorization){
        return res.status(401).json({error:"You must be logged in, token not given"});
    }
    const token =authorization.replace("Bearer","");
    console.log(token);

    jwt.verify(token, process.env.JWT_SECRET,(err,playload)=>{
        if(err){
            return res.status(401).json({error:"You must be logged in,token invalid"});
        }
        const{_id}=playload;
        LawyerUsers.findById(_id).then(
            userdata=>{
                res.status(200).send({message:"LawyerUsers Found",user:userdata});
            })
    })
})


//changepassword
router.post('/lawchangepassword',(req,res)=>{
    const {oldpassword,newpassword,email}=req.body;
    if(!oldpassword || !newpassword || !email){
        return res.status(422).json({error:"Please add all the fields"});
    }
    else{
        LawyerUsers.findOne({email:email})
        .then(async savedUser =>{
            if(savedUser){
                bcrypt.compare(oldpassword,savedUser.password)
                .then(doMatch=>{
                    if(doMatch){
                        savedUser.password= newpassword;
                        savedUser.save()
                        .then(user=>{
                            res.json({message:"Passsword changed Successfully"});
                        })
                        .catch(err=>{
                            //console.log(err);
                            return res.status(422).json({errror:"Server Error"});
                        })
                    }
                    else{
                        return res.status(422).json({error:"Invalid Credentials"})
                    }
                })
            }
            else{
                return res.status.json({error:"Invalid credentials"});
            }
        })
    }
})
//update user data
router.post('/lawsetusername',(req,res)=>{
    const { username, email} = req.body;

    if(!username || !email){
        return res.status(422).json({error: "Please add all the fields"});
    }
    else{
        LawyerUsers.find({username}).then(async (savedUser)=>{
            if(savedUser.length>0){
                return res.status(422).json({error:"Username already exists"});
    
            }
            else{
                LawyerUsers.findOne({email:email})
                .then(async savedUser=>{
                    if(savedUser){
                        savedUser.username = username;
                        savedUser.save()
                        .then(user=>{
                            res.json({message:"Username Updated Successfully"});
                        })
                        .catch(err =>{
                            return res.status(422).json({error: "Server Error"});
                        })
                    }
                    else{
                        return res.status(422).json({error: "Invalid Credentials"});
                    }
                })
            }
        })
    }
})

//description
router.post('/lawsetdescription',(req,res)=>{
    const {description ,email} = req.body;
    if(!description || !email){
        return res.status(422).json({error:"Please add all the fields"});
    }
    LawyerUsers.findOne({email:email})
    .then(async savedUser=>{
        if(savedUser){
            savedUser.description = description;
            savedUser.save()
            .then(user=>{
                res.json({message:"Description Updated Successfully"});
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

//get searched user by keyboard
router.post('/lawsearchuser',(req,res)=>{
    const {keyword} = req.body;
    if(!keyword){
        return res.status(422).json({error: "Please search a username"});
    }

    LawyerUsers.find({username: {$regex:keyword,$options:'i'}})
    .then(user =>{
        //console.log(user);
        let data =[];
        user.map(item => {
            data.push(
                {
                    _id: item._id,
                    username: item.username,
                    email: item.email,
                    description: item.description,
                    profilepic:item.profilepic
                }
            )
        })
        console.log(data);
        if(data.length == 0){
            return res.status(422).json({error: "No LawyerUsers Found"})
        }
        res.status(200).send({message:"LawyerUsers Found",
            user: data
        })
    })
    .catch(err =>{
        res.status(422).json({error: "Server error"});
    })
})

//get user by id
router.post('/lawotheruserdata',(req,res)=>{
    const {email} = req.body;
    
    
        LawyerUsers.findOne({email:email}).then(
            saveduser=>{
                if(!saveduser){
                    return res.status(422).json({error: "Invalid Credentials"});
                }

                let data={
                    _id: saveduser._id,
                    username: saveduser.username,
                    email: saveduser.email,
                    description: saveduser.description,
                    profilepic: saveduser.profilepic,
                    following: saveduser.following,
                    followers: saveduser.followers,
                    posts: saveduser.posts

                }

                res.status(200).send({
                    user: data,
                    message:"LawyerUsers Found"
                })
                
            })
    })



//check follow
router.post('/lawcheckfollow', (req, res) => {
    const { followfrom, followto } = req.body;
    console.log(followfrom, followto);
    if (!followfrom || !followto) {
        return res.status(422).json({ error: "Invalid Credentials" });
    }
    LawyerUsers.findOne({ email: followfrom })
        .then(mainuser => {
            if (!mainuser) {
                return res.status(422).json({ error: "Invalid Credentials" });
            }
            else {
                let data = mainuser.following.includes(followto);
                console.log(data);
                if (data == true) {
                    res.status(200).send({
                        message: "LawyerUsers in following list"
                    })
                }
                else {
                    res.status(200).send({
                        message: "LawyerUsers not in following list"
                    })
                }
            }

        })
        .catch(err => {
            return res.status(422).json({ error: "Server Error" });
        })
})
//follow user

router.post('/lawfollowuser', (req, res) => {
    const { followfrom, followto } = req.body;
    console.log(followfrom, followto);
    if (!followfrom || !followto) {
        return res.status(422).json({ error: "Invalid Credentials" });
    }
    LawyerUsers.findOne({ email: followfrom })
        .then(mainuser => {
            if (!mainuser) {
                return res.status(422).json({ error: "Invalid Credentials" });
            }
            else {
                if (mainuser.following.includes(followto)) {
                    console.log("already following");
                }
                else {
                    mainuser.following.push(followto);
                    mainuser.save();
                }
                // console.log(mainuser);


                LawyerUsers.findOne(
                    { email: followto }
                )
                    .then(otheruser => {
                        if (!otheruser) {
                            return res.status(422).json({ error: "Invalid Credentials" });
                        }
                        else {
                          
                            if (otheruser.followers.includes(followfrom)) {
                                console.log("already followed");
                            }
                            else {
                                otheruser.followers.push(followfrom);
                                otheruser.save()
                            }
                            res.status(200).send({
                                message: "LawyerUsers Followed"
                            })
                        }
                    })
                    .catch(err => {
                        return res.status(422).json({ error: "Server Error" });
                    })
            }

        }
        ).catch(err => {
            return res.status(422).json({ error: "Server Error" });
        })
})


// unfollow user
router.post('/lawunfollowuser', (req, res) => {
    const { followfrom, followto } = req.body;
    console.log(followfrom, followto);
    if (!followfrom || !followto) {
        return res.status(422).json({ error: "Invalid Credentials" });
    }
    LawyerUsers.findOne({ email: followfrom })
        .then(mainuser => {
            if (!mainuser) {
                return res.status(422).json({ error: "Invalid Credentials" });
            }
            else {
                if (mainuser.following.includes(followto)) {
                    let index = mainuser.following.indexOf(followto);
                    mainuser.following.splice(index, 1);
                    mainuser.save();

                    LawyerUsers.findOne(
                        { email: followto }
                    )
                        .then(otheruser => {
                            if (!otheruser) {
                                return res.status(422).json({ error: "Invalid Credentials" });
                            }
                            else {
                                if (otheruser.followers.includes(followfrom)) {
                                    let index = otheruser.followers.indexOf(followfrom);
                                    otheruser.followers.splice(index, 1);
                                    otheruser.save();
                                }
                                res.status(200).send({
                                    message: "LawyerUsers Unfollowed"
                                })
                            }
                        })
                        .catch(err => {
                            return res.status(422).json({ error: "Server Error" });
                        })
                }
                else {
                    console.log("not following");
                
                }
                // console.log(mainuser);



            }
        })
        .catch(err => {
            return res.status(422).json({ error: "Server Error" });
        })
})



//all users from database
router.get('/lawgetAllUser',async(req,res)=>{
    try{
        const allUser = await LawyerUsers.find({});
        res.send({status:'ok',data: allUser});
        console.log(allUser);
    }catch(error){
        console.log(error);
    }
})



module.exports= router;