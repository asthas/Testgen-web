var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	username: String,
	password: String,
	cases: [{
		input_file: {type: String}, 
		input_testcase: {type: String},
		output_testcase: {type: String}, 
		output_coverage: {type: String}
	}]
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);

