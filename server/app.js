
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , auth = require('./routes/auth');

var app = module.exports = express.createServer();

// Passport configuration 
passport.use(new LocalStrategy( auth.auth ) );
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

var login_protect = function(req, res, next) {
	if( req.user )
		next();
	else
		res.redirect("/login");
}

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // Passport
  app.use(express.cookieParser());
  app.use(express.session({secret: "awesome-o"}));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/dashboard', login_protect, routes.index);
app.get('/login', routes.login);
app.post('/login', passport.authenticate('local', {
		successRedirect: "/dashboard",
		failureRedirect: "/login"}
		));

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
