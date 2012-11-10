
/*
 * GET home page.
 */
var forms = require('./forms'),
    models = require('./model'),
	async  = require('async');

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
	var currentUser = req.user;

	async.parallel([
		function(callback) {
			models.Project.find({_id: {$in: currentUser.projects } }, function(err, projects){
				callback(err, projects);
			});
		}],
		function(err, results){
		var projects = results[0];
		console.log(projects);

		res.render('dashboard', {
			title: 'Dashboard', 
			projects: projects, 
			experiments: projects.experiments
		});
	});
}

exports.project_info = function(req, res)
{
	var id = req.params.id;
	
	async.parallel([
		function(callback) {
			models.Project.findOne({_id: id}, callback);
		},function(callback){
			models.Revision.find({project: id}, callback);
	}], function(err, results)
	{
		var project = results[0];
		var revisions = results[1];
		res.render('project_info', {
			title: project.name,
			project: project,
			revisions: revisions
		});
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
		var currentUser = req.user;

		project.name = form.data.project_name;
		currentUser.projects.push(project._id);

		async.parallel([
			function(callback){
			   project.save(function(err) {
				   callback(err, project);
			   });
			}, function(callback){
				currentUser.save(function(err) {
					callback(err, currentUser);
				});
			}
		], function(err, results){
			res.redirect('/dashboard');
		});


	  }, error: function(form){
		  exports.project_new(req, res);
	  },empty: function(form){
		  exports.project_new(req, res);
	  }
  });
}


exports.revision_create = function(req, res) {
	var form = forms.revision;
	res.render('revision_new', {
		title: 'Upload revision',
		form: form.toHTML()
	});
}

exports.revision_create_post = function(req, res)
{
	var form       = forms.revision;
	async.series([

	    function(callback){
			form.handle(req, { 
				success: function(form){
					console.log('formSuccess');
					callback(null, form.data);
				},error: function(form){ callback('Error validating the form', null); }
				 ,empty: function(form){ callback('Error form is empty', null); } 
			});
		}
	],function(err, results){
		if( err) 
			exports.project_info(req, res);
		var upload = req.files.upload;
		if(!upload || upload.length == 0)
			exports.project_info(req, res);

		var form = results[0];
		var revision = new models.Revision(form);
		revision.filename = upload.path;
		revision.project = req.params.id;

		revision.save(function(err){
			exports.project_info(req, res);
		});

	});
}
