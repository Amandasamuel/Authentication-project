require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require ("passport-local-mongoose");

//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
//const bcrypt = require("bcrypt");
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
//const saltRounds = 10;

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
const userSchema = new mongoose.Schema({
  email: String,   
  password: String
});

userSchema.plugin(passportLocalMongoose);
//const secret = "Thisisourlittlesecret.";
//userSchema.plugin(encrypt, {secret: process.env.S3_BUCKET, encryptedFields:["password"]});

const User =new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 
app.get("/", function(req, res){
 
    res.render("home"); 
});

app.get("/login", function(req, res){
    res.render("Login");
});

app.get("/register", function(req, res){
    res.render("Register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  } else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  //req.logout();
  res.redirect("/");
});

app.post("/register",function(req, res){
User.register({username:req.body.username }, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req, res,function(){
      res.redirect("/secrets");
    });
  }
})


  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
   
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  //   newUser.save(function(err){
  //     if(err){
  //       console.log(err);
  
  //     }else {
  //       res.render("secrets");
  //     }
  //   }); 
  // });
   
    // Store hash in your password DB.
});

app.post("/login",function(req, res){
const user = new User({
  // const user =new User({
    username: req.body.username,
    password: req.body.password
  });
req.login(user,function(err){
  if(err){console.log(err);
  }else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets");
    });    
  }
})


// })

//   const username= req.body.username;
//  const password=req.body.password;
//   User.findOne({email: username}, function(err, foundUser){
//     if(err){
//       console.log(err);
//     }else{
//       if(foundUser){
//         bcrypt.compare(password, foundUser.password, function(err, result) {
//           if(result === true){
//             res.render("secrets");
//           }// result == true
//       });       
//       }
//     }
//   });
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});