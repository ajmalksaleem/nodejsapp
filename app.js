const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const encrypt = require("mongoose-encryption");
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

///////session----section--////////////////////

const sessionOptions = {
    secret: '1234yifh', 
    resave: false, // Don't save session if unchanged  //for more info : https://g.co/bard/share/60b493588c5f
    saveUninitialized: true, // Create session for new users
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // Set cookie expiry time (24 hours)
};

const secretsession = session(sessionOptions); // creates an instance of the express-session middleware and configures it with the provided sessionOptions object
                                               // just like we create model after creating schema in mongoose

app.use(cookieParser()); // Parse cookie data
app.use(secretsession); // Initialize session middleware


    


////////////mongoose section////////////////////

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/secrets");
const secretSchema = new mongoose.Schema({
    email: String,
    password: String
});

const submitSchema = new mongoose.Schema({
    message: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }

});

const secret = "this is a little secret";

secretSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const item = mongoose.model("user", secretSchema);
const item2 = mongoose.model('messages',submitSchema);


//////////////////////post---section////////////////////////////////////////////////
/*
app.post("/register",(req,res)=>{

    const newUser = new item({
        email: req.body.username,
        password : req.body.password
    })
    newUser.save()
    .then((data)=>{
        res.render('secrets');
    })
    .catch((err)=>{
        console.log("ayyo"+err);
    })
});
*/
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

app.post("/secrets1", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    item.findOne({ email: username })
        .then((foundUser) => {
            if (foundUser) {
                const alreadyExist = "Email ID already exists";
                res.render("register", { alreadyExist });
            } else {
                const newUser = new item({
                    email: req.body.username,
                    password: req.body.password
                });
                newUser.save()
                    .then((data) => {
                        req.session.user = {
                            _id: data._id, // Save the user's ID in the session
                           username: data.username
                          };
/* //*/   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                        res.redirect("/secrets");
                    })
                    .catch((err) => {
                        console.log("ayyo" + err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

/*
app.post("/login",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;                          // if user type email address which is not registered then using this code login doesnt happen but there will be noresponse. so it is modified as below.now at top user doesnt exist will show  
    item.findOne({email:username})
    .then((founduser)=>{
        if(founduser.password === password ){
            res.render("secrets");
        }else{
            incorrect ="password or username dont match"
            res.render("login",{incorrect})
        }
    })
    .catch((err)=>{
       console.log(err);
       
    })
})
*/

app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

app.post("/secrets", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    item.findOne({ email: username })
        .then((founduser) => {
            if (founduser) {
                if (founduser.password === password) {
                    req.session.user = {
                        _id : founduser._id,
                        username: founduser.username
                      };
         /**/   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.redirect("/secrets");
                } else {
                    incorrect = "password or username dont match"
                    res.render("login", { incorrect })
                }
            } else {
                let incorrect = "Account doesn't exist. Register before login"
                res.render("login", { incorrect })
            }

        })
        .catch((err) => {
            console.log(err);

        })
});





app.post('/submitmsg',(req,res)=>{

    const newMessage = new item2({
        message : req.body.secret,
        userId: req.session.user._id
    })
    newMessage.save()
    .then((message)=>{
        res.redirect('/secrets');
    })
    .catch((err)=>{
        console.log("newmessagesecret error"+err);
    })
})


app.post("/deletemsg", (req,res)=>{
   
   const val = req.body.messageid;
   item2.findByIdAndDelete(val)
   .then((data)=>{
    console.log("checked item deleted");
    res.redirect('/secrets')
   })
   .catch((err)=>{
    console.log(err);
   })
})


///////////-------get---section------////////////////////////////
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

app.get('/logout', (req, res) => {
    req.session.destroy();
    
    res.redirect('/');
    
});

app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

app.get('/',(req, res) => {
    if(!req.session.user){
        res.render("home");
    }else{
        res.redirect('/secrets')
    }
    
});

app.get('/login', (req, res) => {
    if(!req.session.user){
        let incorrect = "";
        res.render("login", { incorrect });
    }else{
        res.redirect('/secrets')
    }
    
});

app.get('/register' ,(req, res) => {
    if(!req.session.user){
        let alreadyExist = ""
        res.render("register", { alreadyExist });
    }else{
        res.redirect("/secrets")
    }
   
});

app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

app.get('/submit', (req, res) => {
    if(req.session.user){


        res.render("submit");
    }else{
        res.redirect('/')
    }
    
});
  
app.get('/secrets', (req, res) => {
    if(req.session.user){
const userId = req.session.user._id;    
item2.find({userId: userId })
.then((foundmessage)=>{
    res.render("secrets",{foundmessage});
})
.catch((err)=>{
    console.log(err);
})
  
    }else{
        res.redirect("/");
    }
    
});




///////////////////////////////////////////////////////////////////////
app.listen(8000, () => {
    console.log("server start running");
})



