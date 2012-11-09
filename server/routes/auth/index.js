exports.auth = function(username, password, done)
{
	if(username == "kozko2001")
		done(null, {username: "kozko2001"});
	else
		done(null, false, {message: "not valid username"});
}

exports.serializeUser = function(user, done) {
	console.log("serialize user : " + user.username );
	done(null, user.username);
}

exports.deserializeUser = function(id, done){
	console.log("deserialize userid : " + id );
	var user = {username: id};
	done(null, user);
}
