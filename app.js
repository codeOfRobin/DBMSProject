var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var User = require('./models/user')
var async = require('async')
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: './uploads' })
var passport = require('passport')
// var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt   = require('bcrypt-nodejs');
var fs = require('fs')
var jwt = require('jsonwebtoken');
User.sync({force:true})
app.use(express.static(__dirname + '/public'));
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
var secret = 'superSecret'
app.set(secret, "secret");
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


passport.use('localLogin',new LocalStrategy(
    {
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : false
    },
    function(email, password, done)
    {
        User.findOne({ where: { 'email': email } }).then(function(user)
        {
            if (!user)
            {
                return done(null, false, { message: 'email doesnt exists'});
            }
            if (!bcrypt.compareSync(password, user.password))
            {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        })
    }
));

passport.use('localSignup',new LocalStrategy(
    {
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req,email,password,done)
    {
        User.findOne({ where: { 'email': email } }).then(function(user)
        {
            if (user)
            {
                return done(null, false, { message: 'email already exists'});
            }
            else
            {
                var user = User.build({
                    email: email,
                    password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
                })
                console.log(user);
                user.save().then(function() {
                    return done(null, user);
                })

            }
        })
    }
))

// passport.use(new FacebookStrategy({
//
//     // pull in our app id and secret from our auth.js file
//     clientID        : "473466989524267",
//     clientSecret    : "e6cf1704ddfca7af4c590dc656d50377",
//     callbackURL     : "http://localhost:4000/auth/facebook/callback",
//     profileFields: ['id', 'displayName', 'photos', 'email']
// },
// function(token, refreshToken, profile, done)
// {
//     process.nextTick(function()
//     {
//         User.findOne({ where: {fbID: profile.id} }).then(function(user)
//         {
//             if (user)
//             {
//                 return done(null, user); // user found, return that user
//             }
//             else
//             {
//                 var user = User.build({
//                     name: profile.displayName,
//                     fbID: profile.id,
//                     email: profile.emails[0].value,
//                     fbToken: token
//                 })
//                 user.toJSON().save().then(function() {
//                     return done(null, user);
//                 })
//
//             }
//         })
//     });
//
// }));


app.post('/login', function(req, res, next)
{
    passport.authenticate('localLogin', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            console.log(info.message);
            return res.status(401).json({ error: info.message });
        }

        var token = jwt.sign({ foo: 'bar' }, 'shhhhh', {
            expiresIn: 24*60*60 // expires in 24 hours
        });
        res.json({ token : token, userId:user._id, email:user.email, type:user.userType});

    })(req, res, next);
});

app.post('/signup', function(req, res, next)
{
    passport.authenticate('localSignup', function(err, user, info) {
        if (err) { return next(err) }
        var token = jwt.sign({ foo: 'bar' }, 'shhhhh', {
            expiresIn: 24*60*60 // expires in 24 hours
        });
        res.json({ token : token, email:user.email, userId:user._id,type:user.userType});

    })(req, res, next);
});

// app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['user_friends', 'email']}));
//
// app.get('/auth/facebook/callback',
//         passport.authenticate('facebook', {
//             successRedirect : '/',
//             failureRedirect : '/'
//         }));


app.get('/*.mp3',function(req,res)
{
    console.log(req.params);
    res.sendFile(__dirname + '/uploads/'+req.params[0]+'.mp3');
})
app.get('*',function(req,res)
{
    res.sendFile(__dirname + '/public/index.html');
})

app.post('/songs',function(req,res){
    res.json(req.body);
})

app.post('/uploadSongs', upload.any(), function (req, res, next) {
    tmp_path = req.files[0].path;
    originalName=req.files[0].originalname;
    target_path =  req.files[0].path +'.' + "mp3"
    fs.rename(tmp_path, target_path, function(err) {
        if (err)
        throw err;
        fs.unlink(tmp_path, function() {
            if (err)
            throw err;
            res.json("done : "+ target_path)
        });
    });
})
app.listen(4000);
console.log('Magic happens on port 4000');
