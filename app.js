var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var routes = require('./routes/index');

var app = express();

var util = require('util'),
	exec = require('child_process').exec,
	fs = require('fs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon('__dirname' + './public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('express-session')({
	secret: 'keyboard cat',
	resave : false,
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', routes);

app.use(express.static(path.join(__dirname, 'public')));

var output = '';



function deleteTestCases(userdir) {
	exec(['rm programs/' + userdir +'/*.tc']);
}

function endsWithTC(file) {
	return (file.indexOf('.tc', file.length - '.tc'.length) !== -1);
}

function searchTestcaseFile(res, userdir) {
	var ls = exec(['ls programs/'+ userdir], function(err, stdout, stderr){
		var files = stdout.split('\n');
		var tc = files.filter(endsWithTC);
		console.log(files, tc);
		displayTestcases(tc[0], res, userdir);
	});
}



function displayTestcases(tc, res, userdir) {
	fs.readFile('./programs/' + userdir + '/' + tc, 'utf8', function(err, data){
		if(err)
			console.log(err);
		res.send(data);
	});
}


function compileTemp(userdir) {
	var compile = exec(['clang programs/temp.c -o programs/' + userdir + '/temp.out']);
}


function applyTestGen(res, userdir) {
	deleteTestCases(userdir);
	var testgen = exec(['./Testgen.sh programs/' + userdir + '/temp.c main > programs/' + userdir + '/output'], function(err, stdout, stderr){
		
		fs.readFile('./programs/' + userdir + '/output', 'utf8', function(err, data){
			var lines = data.split('\n');
			var coverages = lines.filter(function(line){
				return(line.indexOf('COVERAGE') !== -1);
			});
			res.send(coverages[coverages.length - 1]);
		});
			
	});

}

app.post('/filecontent', function(req, res) {
	var user = req.user;
	var userdir = user.username;
	
	var data = req.body;

	var file = data.content;

	Account.findById(userdir, function(err, account) {
		if (!err) {
			account.files.push(file);
			account.save();
		}
	});

	fs.writeFile(__dirname + "/programs/" + userdir + "/temp.c", file, function(err){
		if(err)
			console.log(err);
		compileTemp(userdir);
		applyTestGen(res, userdir);
	});

	
});

app.get('/testCases', function(req, res){
	var user = req.user;
	var userdir = user.username;
	searchTestcaseFile(res, userdir);
});


var Account = require('./model/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://localhost/Testgen');
app.use(function(req, res, next){
	var err = new Error('not found');
	err.status(404);
	next(err);
})




	
app.listen(3000, function() {
	console.log('Serving on 3000');
});

module.exports = app;