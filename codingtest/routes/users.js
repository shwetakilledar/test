var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb').MongoClient;

var url='mongodb://localhost:27017/codingtest3';


var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

//after logged in
router.get('/addDrop', function(req, res){
	var resultArray = [];
  mongo.connect(url, function(err, db) {
    if (err) throw err;
    var cursor = db.collection('songs').find();
    cursor.forEach(function(doc, err) {
      if (err) throw err;
      resultArray.push(doc);
    }, function() {
      //console.log(resultArray);
      db.close();
      
      res.render('addDrop', {items: resultArray});
    });
  });
});


//Library

router.get('/library', function(req, res){
	res.render('library');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	
	

// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			username: username,
			password: password
			
			
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'Registered ');
		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/users/addDrop', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/users/addDrop',+ req.user.username);
  });



router.post('/addDrop', function(req, res){
	var username=req.user.username;
  var addedId=req.body.addedId;
  //console.log(username);
	
	var action=req.body.dropdownlist;
	console.log(action);
	if(action=="add"){
		//console.log(action);
	var update = {
    
    $push: { songids:{$each:[addedId]}  }
  	};

  	}

  	else if(action=="drop")
  	{
  		//console.log(action);
  		var update = {
    
    $pull: { songids:addedId }
  	};


  	}

  var query = {
    username:username
  };

  User.update(query, update, function(err, result) {
    if(err) { throw err; }
    
  });
var resultArray = [];
  mongo.connect(url, function(err, db) {
    if (err) throw err;
    var cursor = db.collection('songs').find();
    cursor.forEach(function(doc, err) {
      if (err) throw err;
      resultArray.push(doc);
    }, function() {
      //console.log(resultArray);
      db.close();
      
      res.render('addDrop', {items: resultArray});
    });
  });
});




router.post('/library', function(req, res) {
    res.redirect('/users/library');
  });




router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;