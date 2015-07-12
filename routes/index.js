var express = require('express');
var passport = require('passport');
var Account = require('../model/account');
var exec = require('child_process').exec;

var router = express.Router();



router.get('/', function(req, res){
	if (req.user) {
		exec(['mkdir programs/' + req.sessionID]);
		res.render('testgen', {user: req.user});
	} else {
		res.render('index', {user: req.user});
	}
});

router.get('/testgen.html', function(req, res, next) {
	res.redirect('/');
});

router.get('/register', function(req, res){
	res.render('register',  {});
});

router.post('/register', function(req, res){
	var user = {
		username : req.body.username,
		password : req.body.password,
		email    : req.body.email
	};
	Account.register(new Account({username: user.username, email: user.email}), user.password, function(err, account) {
		if(err){
			return res.render("register", {info: "Sorry. That username already exists. Try again."});
		}
		res.redirect('/');
	});
});

router.get('/login', function(req, res) {
	res.render('login', {user: req.user});
});

router.post('/login', passport.authenticate('local', {
	successRedirect  : '/',
	failureRedfirect : '/register'
}));

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

router.get('/ping', function(req, res){
	res.status(200).send("pong!");
});

module.exports = router;