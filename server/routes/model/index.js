var  mongoose = require('mongoose')
    ,crypto   = require('crypto');

var Experiment = new mongoose.Schema({
	name: String,
	revision: {type:mongoose.Schema.Types.ObjectId, ref: 'Revision'},
	probability: Number, 
	payload: String
});

var Project = new mongoose.Schema({
	name: String,
	description: String,
	date: { type: Date, default: Date.now},
	experiments: [{ type: mongoose.Schema.ObjectId, ref: 'Experiment' }]
});

var Revision = new mongoose.Schema({
	name: String,
	filename: String,
	description: String,
	payload: String,
	project: mongoose.Schema.Types.ObjectId
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
	exports.Project  = db.model('Project', Project);
	exports.Revision = db.model('Revision', Revision);
	exports.User     = db.model('User', User);
	exports.Experiment = db.model('Experiment', Experiment);

	return exports;
}
