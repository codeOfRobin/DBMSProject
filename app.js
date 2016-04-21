var express = require('express');
var app = express();
var morgan = require('morgan');
var Potluck = require('./models/potluck')
var User = require('./models/user')
var async = require('async')
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: './uploads' })
var bcrypt   = require('bcrypt-nodejs');
var fs = require('fs')
var jwt = require('jsonwebtoken');
var cors = require('cors')
var request = require('request');
User.sync({force:true})
app.use(express.static(__dirname + '/public'));
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
var secret = 'superSecret'
app.set(secret, "secret");

app.post('/auth/facebook', function(req, res) {
  var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: "e6cf1704ddfca7af4c590dc656d50377",
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      console.log(profile);
    //   if (req.header('Authorization')) {
    //     User.findOne({ facebook: profile.id }, function(err, existingUser) {
    //       if (existingUser) {
    //         return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
    //       }
    //       var token = req.header('Authorization').split(' ')[1];
    //       var payload = jwt.decode(token, config.TOKEN_SECRET);
    //       User.findById(payload.sub, function(err, user) {
    //         if (!user) {
    //           return res.status(400).send({ message: 'User not found' });
    //         }
    //         user.facebook = profile.id;
    //         user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
    //         user.displayName = user.displayName || profile.name;
    //         user.save(function() {
    //           var token = createJWT(user);
    //           res.send({ token: token });
    //         });
    //       });
    //     });
    //   } else {
        // Step 3. Create a new user account or return an existing one.
        // User.findOne({ facebook: profile.id }, function(err, existingUser) {
        //   if (existingUser) {
        //     var token = createJWT(existingUser);
        //     return res.send({ token: token });
        //   }
        //   var user = new User();
        //   user.facebook = profile.id;
        //   user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
        //   user.displayName = profile.name;
        //   user.save(function() {
        //     var token = createJWT(user);
        //     res.send({ token: token });
        //   });
        // });
        var token = jwt.sign({ foo: 'bar' }, 'shhhhh', {
            expiresIn: 24*60*60 // expires in 24 hours
        });
        res.json({ token : token, profile:profile});
    //   }
    });
  });
});
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
app.listen(3000);
console.log('Magic happens on port 3000');
