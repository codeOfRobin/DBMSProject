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
var FacebookStrategy = require('passport-facebook').Strategy;
var fs = require('fs')
User.sync({force: true})
app.use(express.static(__dirname + '/public'));
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
// Potluck.findAll().then(function(potlucks){
//     console.log(potlucks.map(function(p){
//         return p.dataValues
//     }));
// })

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new FacebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID        : "473466989524267",
    clientSecret    : "e6cf1704ddfca7af4c590dc656d50377",
    callbackURL     : "http://localhost:4000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
},
function(token, refreshToken, profile, done)
{
    process.nextTick(function()
    {
        User.findOne({ where: {fbID: profile.id} }).then(function(user)
        {
            if (user)
            {
                return done(null, user); // user found, return that user
            }
            else
            {
                var user = User.build({
                    name: profile.displayName,
                    fbID: profile.id,
                    email: profile.emails[0].value,
                    fbToken: token
                })
                user.save().then(function() {
                    return done(null, user);
                })

            }
        })
    });

}));

app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['user_friends', 'email']}));

app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/'
        }));


app.get('/*.mp3',function(req,res)
{
    console.log(req.params);
    res.sendFile(__dirname + '/uploads/'+req.params[0]+'.mp3');
})
app.get('*',function(req,res){
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
        // Delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files.
        fs.unlink(tmp_path, function() {
            if (err)
            throw err;
            //
            res.json("done : "+ target_path)
        });
    });
})
app.listen(4000);
console.log('Magic happens on port 4000');
