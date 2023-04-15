const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnect");
const MyUsers = require("./models/userModel");
const Images = require("./models/imagesModel");
const MyEntry = require("./models/entryModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); 
const JWT_SECRET = "soiiubgb487392wbeis7fuiybgbagv983";

var nodemailer = require('nodemailer');
//execute database connection
dbConnect();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res, next) => {
  res.json({ message: "Hey! Server is working fine!" });
  next();
});

app.post("/signup", async (req, res) => {
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
});

app.post("/login-user", async (req, res) => {
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

});

app.post("/user-dashboard", async (req, res) => {
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
})

//password reset function

app.post("/forgot-password", async (req, res) => {
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
})

app.get("/reset-password/:id/:token", async (req, res) => {
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
})

app.post("/reset-password/:id/:token", async (req, res) => {
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
})

// api to fetch users data

app.get("/getAllUsers", async (req, res) => {
  try {
     const allUsers = await MyUsers.find({});
     res.send({ status: "ok", data: allUsers})
  } catch (error) {
    console.log(error)
  }
})

// handle image uploading
app.post("/upload-image", async (req, res) => {
  const {base64} = req.body
  try {
   await Images.create({ image:base64});
    res.send({ status: "ok"});
  } catch (error) {
    res.send({ status: "error", data: error});
     console.log(error);
  }
})
// get the file

app.get("/get-image", async (req, res) => {
  try {
  await  Images.find({}).then(data => {
      res.send({ status: "ok", data: data})
    })
  } catch (error) {
    
  }
})

app.post("/newuser-entry", async (req, res) => {
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
})

//get specific user entry

app.get("/user-entry", async (req, res) => {
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
})

//user entry details

app.get("/userentry/:id", async (req, res) => {
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
})

// delete entry

app.delete("/delete-entry/:id", async (req, res) => {
  const {id} = req.params;
  console.log(id);
  try {
   const deleteEntry = MyEntry.findByIdAndDelete(id)
    .then(result =>  res.status(200).json({ status: "ok", data: deleteEntry })) 
    .catch(err =>  console.log(err) )
  } catch (error) {
    console.log(error);
  }
})

// Project by Adedotun Os-Efa
module.exports = app;
