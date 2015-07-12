var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
var mandrillTransport = require('nodemailer-mandrill-transport');


var routes = require('./routes/index');

var app = express();

var util = require('util'),
	exec = require('child_process').exec,
	spawn = require('child_process').spawn,
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

function searchTestcaseFile(res, userdir, userid) {
	console.log('\n\n\nuserdir', userdir);
	console.log('\n\n\nuserid', userid);
	var ls = exec(['ls programs/'+ userdir], function(err, stdout, stderr){
		
		var files = stdout.split('\n');
		var tc = files.filter(endsWithTC);
		
		console.log(files, tc);
		displayTestcases(tc[0], res, userdir, userid);
	});
}



function displayTestcases(tc, res, userdir, userid) {
	fs.readFile('./programs/' + userdir + '/' + tc, 'utf8', function(err, data){
		if(err) {
			console.log(err);
		}
		Account.findById(userid, function(err, account){
			if(!err) {
				var length = account.cases.length;
				var currentCase = account.cases[length-1];//created a copy
				currentCase.output_testcase = data;//augmented 
				account.cases[account.cases.length-1] = currentCase;
				account.save();//reflected back the changes
				sendEmail(account.email, currentCase);
			}
		});
		res.send(data);
	});
}

function sendEmail(email, currCase) {
	console.log("Sending email to", email, 'with content', currCase);
 
	var transport = nodemailer.createTransport(mandrillTransport({
		auth: {
			apiKey: 'rOu5LBQuNFHq07ROTmlHjA'
		}
	}));
	
	var content  = '<h1>Testgen Report</h1><br><h3>Coverage: ' + currCase.output_coverage + '</h3><br>';
	content += '<h3>Test Case:</h3><br><p>' + currCase.output_testcase + '</p>';

	transport.sendMail({
		from: 'developer@testgen.com',
		to: email,
		subject: 'Testgen Report',
		html: content
	}, function(err, info) {
		if (err) {
			console.error(err);
		} else {
			console.log(info);
		}
	});
}


function compileTemp(userdir, userid, res) {
	var command = 'clang programs/'+ userdir +'/temp.c -o programs/' + userdir + '/temp.out';
	console.log('\nCompile command:', command, '\n');
	var compile = exec([command], function(err, data) {
		if (!err) {
			applyTestGen(res, userdir, userid);
		}
	});
}



function applyTestGen(res, userdir, userid) {
	deleteTestCases(userdir);
	var command = './Testgen.sh';
	var arguments = ['programs/' + userdir + '/temp.c', 'main']
	console.log(command);
	var testgen = spawn(command, arguments);
	
	testgen.stdout.on('data', function(data) {
		console.log('data:', data);
		output += data;
	});
	
	testgen.on('exit', function(close) {
		var lines = output.split('\n');
		var coverages = lines.filter(function(line){
			return(line.indexOf('COVERAGE') !== -1);
		});
		console.log('close:', close, '\n', output, '\n\n is empty?');
		res.send(coverages[coverages.length - 1]);
		Account.findById(userid, function(err, account){
			if(!err) {
				var length = account.cases.length;
				var currentCase = account.cases[length - 1];
				currentCase.output_coverage = coverages[coverages.length - 1];
				account.cases[account.cases.length - 1] = currentCase;
				account.save();

			}
		});
	});

}


app.post('/filecontent', function(req, res) {
	var user = req.user;
	var userid = user._id;
	var userdir = req.sessionID;
	
	var data = req.body;

	var file = data.content;
	var myCase = {input_file: file};

	Account.findById(userid, function(err, account) {
		if (!err) {
			account.cases.push(myCase);
			account.save();
		}
	});

	fs.writeFile(__dirname + "/programs/" + userdir + "/temp.c", file, function(err){
		if(err)
			console.log(err);
		compileTemp(userdir, userid, res);
		//applyTestGen(res, userdir, userid);
	});

	
});

app.get('/testCases', function(req, res){
	var user = req.user;
	var userid = user._id;
	var userdir = req.sessionID; 
	searchTestcaseFile(res, userdir, userid);
});


var Account = require('./model/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://localhost/Testgen');
// app.use(function(req, res, next){
// 	var err = new Error('not found');
// 	err.status(404);
// 	next(err);
// });
	
app.listen(3000, function() {
	console.log('Serving on 3000');
});

module.exports = app;