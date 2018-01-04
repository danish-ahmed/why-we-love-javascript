var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var localStrategy = require('passport-local')
var cookie = require('cookie-parser')

// SET LOCAL VARIABLES
router.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  User.find()
    .sort({createdAt: 'descending'})
    .exec(function(err, users){
      if(err){ return next(err) }
      res.render('index', { users: users });
    })
});

// SIGNUP
router.get('/signup', function(req, res, next){
  res.render('signup')
})

router.post('/signup', function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username}, function(err, user){
    if(err){ return next(err); }
    if(user){
      req.flash('error', "username already exist");
      return res.redirect('/signup')
    }
    var newUser = new User({username, password});
    newUser.save(next)  
  });
  }, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect:'/signup',
    failureFlash:true
  }
));

router.get('/users/:username', function(req, res, next){
  var username = req.params.username;
  User.findOne({username}, function(err, user){
    if(err){ return next(err); }
    if(!user){ return next(404); }
    res.render("profile", {user});
  });
})

router.get('/login', function(req, res, next){
  res.render('login')
});

router.post('/login', passport.authenticate('local', {
  successRedirect:'/edit',
  failureRedirect: '/login',
  failureFlash: true
}),function(req, res){
  res.render('error')
});

router.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/')
});

function ensureAuthentication(req, res, next){
  console.log(req.isAuthenticated(), req.currentUser)    
  if(req.isAuthenticated()){
    next()
  }
  else{
    req.flash('error', 'you must be login to see this page');
    res.redirect('/login')
  }
}

router.get('/edit', ensureAuthentication, function(req, res, next){
  res.render('edit')
})

module.exports = router;
