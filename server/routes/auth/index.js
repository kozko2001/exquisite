exports.auth = function(username, password, done)
{
	User.findOne({username: username, hash: User.generateHash(password)}, function(err, user){
		if(err)
			done(null, false, {message: 'No username match'});
		else
			done(null, user);
	});
}

exports.setModel= function(model)
{
	User = model.User;
}

exports.serializeUser = function(user, done) {
	console.log("serialize user : " + user.username );
	done(null, user._id.toHexString());
}

exports.deserializeUser = function(id, done){
	console.log("deserialize userid : " + id );
	User.findOne({_id: id}, function(err, user){
		if(!err)
			done(null, user);
		else
			console.log('error finding the user?');
	});
}
