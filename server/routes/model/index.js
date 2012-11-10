var  mongoose = require('mongoose')
    ,crypto   = require('crypto');

var Project = new mongoose.Schema({
	name: String,
	description: String,
	date: { type: Date, default: Date.now},
	experiments: [
	{
		shortname: String,
		revision: mongoose.Schema.Types.ObjectId,
		probability: Number
	}]
});

var Revision = new mongoose.Schema({
	filename: String,
	description: String,
	payload: String
});

var User = new mongoose.Schema({
	username: String,
	hash: String,
	projects: [ { id: mongoose.Schema.Types.ObjectId }]
});

User.statics.generateHash = function (password)
{
	var hash = crypto.createHash('sha1');	
    hash.update(password);
	return hash.digest('hex');
}

User.methods.auth = function (username, password) 
{
	return this.username === login && this.hash === this.generateHash(password) ;
}

exports.createModels = function(db) 
{
	var model = {};
	model.Project  = db.model('Project', Project);
	model.Revision = db.model('Revision', Revision);
	model.User     = db.model('User', User);

	return model;
}
