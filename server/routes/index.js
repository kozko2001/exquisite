
/*
 * GET home page.
 */
var forms = require('./forms'),
    models = require('./model');

exports.index = function(req, res){
  res.render('index', { title: 'Express ' + req.user.username })
};

exports.login = function(req, res) {
  var reg_form = forms.login;
  res.render('login', {
	  title: 'Login',
	  form : reg_form.toHTML() 
  } );
}

exports.dashboard = function(req, res)
{
	res.render('dashboard', {
		title: 'Dashboard'
	});
}

exports.project_new = function(req,res){
  var form = forms.project_new;
  res.render('project_new',{
	  title: 'Create a new project',
	  form:  form.toHTML()
  });
}

exports.project_new_post = function(req,res)
{
  var form = forms.project_new;
  form.handle(req, { 
	  success: function(form) {
		console.log('form project name = ' + form.data.project_name);
		var project = new models.Project();
		project.name = form.data.project_name;

		project.save(function(err){
			res.redirect('/dashboard');
		});
	  }, error: function(form){
		  exports.project_new(req, res);
	  },empty: function(form){
		  exports.project_new(req, res);
	  }
  });
}

