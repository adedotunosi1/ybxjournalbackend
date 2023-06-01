const MyUsers = require("../models/userModel");
const Images = require("../models/imagesModel");
const MyEntry = require("../models/entryModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "soiiubgb487392wbeis7fuiybgbagv983";
var nodemailer = require('nodemailer');

const journal_signup = async (req, res, next) => {
    const {name, id, password, email, phone} = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(req.body);
    try {
      const oldUser = await MyUsers.findOne({ email }); 
      if(oldUser){
       throw new Error("Email already exists"); 
      }
      await MyUsers.create({
           name,
           id,
           password: encryptedPassword,
           email,
           phone,
      });
      res.send({status: "ok"})
    }
    catch(error) {
      res.send({status: "error"});
    }
};

const journal_login = async (req, res, next) => {
    const { id, password } = req.body;
  
      const user = await MyUsers.findOne({ id });
      if(!user){
        return res.json({ error: "User not found"});
      }
      if( await bcrypt.compare(password, user.password)){
        const token = jwt.sign({id:user.id}, JWT_SECRET);
         if(res.status(201)){
          return res.json({ status: "ok", data: token });
         } else {
          return res.json({ error: "error"});
         }
      }
      res.json({ status: "error", error: "Invalid Password"});
  
}

const journal_dashboard = async (req, res, next) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      const userid = user.id;
      MyUsers.findOne({ id: userid}).then((data) => {
        res.send({ status: "ok", data: data});
      }).catch((error) => {
        res.send({ status: "error", data: error});
      });
    } catch (error) {
    }
}

const journal_forgotpass = async (req, res, next) => {
    const {email} = req.body;
     try {
      const oldUser = await MyUsers.findOne({ email });
      let emails = oldUser.email;
      emails = emails.replace(/'/g, '');
      console.log(emails);
      if(!oldUser){
      return res.json({ status: "User does not exist!!"});
      }
      const secret = JWT_SECRET + oldUser.password;
      const token = jwt.sign({ email: oldUser.email, id: oldUser.id },secret,{
        expiresIn: "5m",
      });
      const link = `https://ybxjournall.onrender.com/${oldUser._id}/${token}`;
      console.log(link);
      const message = `Reset your Passoword using the following link :- \n\n ${link} \n\nif you have not requested this email then, please ignore it`;
   
      const transporter = nodemailer.createTransport({
        service: process.env.SMPT_SERVICE,
        auth: {
          user: process.env.SMPT_MAIL,
          pass: process.env.SMPT_PASSWORD,
        },
      });
      
      const mailOptions = {
        from: 'ybxjournal@gmail.com',
        to: emails,
        subject: 'YBXJournal Password Reset',
        text: message,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return res.json({ error: "error"});
        } else {
          console.log('Email sent: ' + info.response);
          return res.json({ status: "ok"});
        }
      });
     } catch (error) {
      console.log(error)
     }
}

const journal_resetpass = async (req, res, next) => {
    const {id, token } = req.params;
    console.log(req.params);
    const oldUser = await MyUsers.findOne({ _id: id }); 
      if(!oldUser){
      return res.json({ status: "User does not exist!!"});
      }
      const secret = JWT_SECRET + oldUser.password;
      try {
        const verify = jwt.verify(token, secret);
        res.render("index", {email: verify.email, status: "Not Verified"})
      } catch (error) {
        console.log(error);
        res.send("Not Verified");
      }
}

const journal_passreset = async (req, res, next) => {
    const {id, token } = req.params;
    const {password} = req.body;
    const oldUser = await MyUsers.findOne({ _id: id }); 
      if(!oldUser){
      return res.json({ status: "User does not exist!!"});
      }
      const secret = JWT_SECRET + oldUser.password;
      try {
        const verify = jwt.verify(token, secret);
        const encryptedPassword = await bcrypt.hash(password, 10);
        await MyUsers.updateOne({
          _id: id,
        }, {
          $set: {
            password: encryptedPassword,
          },
        });
        res.json({ status: "Password Updated"});
        res.render("index", {email: verify.email, status: "Verified"});
      } catch (error) {
        console.log(error);
        res.json({status: "Error: Your password could not be changed."});
      }
}

const journal_users = async (req, res, next) => {
    try {
        const allUsers = await MyUsers.find({});
        res.send({ status: "ok", data: allUsers})
     } catch (error) {
       console.log(error)
     }
}
const journal_imageupload = async (req, res, next) => {
    const {base64} = req.body
    try {
     await Images.create({ image:base64});
      res.send({ status: "ok"});
    } catch (error) {
      res.send({ status: "error", data: error});
       console.log(error);
    }
}
const journal_images = async (req, res, next) => {
    try {
        await  Images.find({}).then(data => {
            res.send({ status: "ok", data: data})
          })
        } catch (error) {
          
        }
}
const journal_newentry = async (req, res, next) => {
    const {title, body, aut, image} = req.body;
    console.log(req.body);
    try {
      MyEntry.create({
        title,
        body,
        aut,
        image,
   });
   res.send({status: "ok"})
    } catch (error) {
      console.log(error);
    }
}
const journal_userentry = async (req, res, next) => {
    const {id} = req.params;
    try {
      const User = await MyEntry.find({}); 
      console.log(User);
      if(!User){
        return res.status(404).json({
          success: false,
          message: "No journal entries found"
        })
      } else{
        res.send({ status: "ok", data: User})
      }
    } catch (error) {
      console.log(error)
    }
}
const journal_entrydetails = async (req, res, next) => {
    const id = req.params.id;
    try {
    const entry =  await MyEntry.findById(id);
      console.log(entry);
      if(!entry){
        return res.status(404).json({
          success: false,
          message: "No entry with such id found"
        })
   } else {
    res.send({ status: "ok", data: entry})
   } } catch (error) {
      console.log(error);
    }
}
const journal_entrydelete = async (req, res) => {
    const {id} = req.params;
    console.log(id);
    try {
     const deleteEntry = MyEntry.findByIdAndDelete(id)
      .then(result =>  res.status(200).json({ status: "ok", data: deleteEntry })) 
      .catch(err =>  console.log(err) )
    } catch (error) {
      console.log(error);
    }
}
module.exports = {
    journal_signup,
    journal_login,
    journal_dashboard,
    journal_forgotpass,
    journal_resetpass,
    journal_passreset,
    journal_users,
    journal_imageupload,
    journal_images,
    journal_newentry,
    journal_userentry,
    journal_entrydetails,
    journal_entrydelete
}