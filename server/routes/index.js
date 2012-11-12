
/*
 * GET home page.
 */
var forms = require('./forms'),
    models = require('./model'),
	async  = require('async'), 
	_ = require('underscore')._;

var routing = {
	dashboard : function() { return "/dashboard"; } ,
	project   : function(projectId) { return "/dashboard/project/" + projectId + "/"; }
}

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
		    var i = 0;
			models.Project.findOne({_id: id}).populate("experiments").run(function(err, p){
				async.forEachSeries(p.experiments, function(e, callback){
					models.Revision.findOne({_id: e.revision}, function(err, r){
						p.experiments[i]._doc.revision = r;
						i++;
						callback();
					});
				}, function(err){
					callback(null,p);
				});
			});
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
  var projectId = req.params.id;
  async.parallel([
	function(callback) {
		if( !projectId) 
			callback(null, null);
		else
			models.Project.findOne({_id: projectId}, callback);
	}
  ],function(err, result){
	  var project = result[0];
	  if( project ) 
		  form =  form.bind(project);

	  res.render('project_new',{
		  title: 'Create a new project',
		  form:  form.toHTML()
	  });
  });
}

exports.project_new_post = function(req,res)
{
  var form = forms.project_new;
  form.handle(req, { 
	  success: function(form) {

		if( req.params.id )
			models.Project.findOne({_id:req.params.id}, function(err, project){
				project.name = form.data.name;
				project.description = form.data.description;
				project.save(function(err){
					res.redirect(routing.project(project._id));
				});
			});
			
		else {
			var project = new models.Project(form.data);
			var currentUser = req.user;
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

					res.redirect(routing.project(project._id));
			});
		}


	  }, error: function(form){
		  exports.project_new(req, res);
	  },empty: function(form){
		  exports.project_new(req, res);
	  }
  });
}

var create_revisionForm = function(projectId, callback)
{
	models.Revision.find({project: projectId}, function(err, revisions){
		var r = _.reduce(revisions, function(revs, r){
			revs[r._id] = r.name;
			return revs;
		}, {});
		callback(null, r);
	});
}

exports.project_experiment_remove = function(req, res)
{
	var projectId = req.params.id;
	var experimentId= req.params.experiment_id;
	
	models.Project.findOne( {_id: projectId}, function(err, project){
		async.parallel([function(callback){
			project.experiments.remove(experimentId);
			project.save(callback );
		},function(callback) { 
			models.Experiment.remove({_id: experimentId}, callback);
		}], function(err, results) { 
			res.redirect(routing.project(projectId));
		});
	});
}

exports.project_experiment_new = function(req, res)
{
	var projectId = req.params.id;
	if( !projectId )
		res.redirect("/dashboard");

	async.parallel([
		function( callback ) {
			create_revisionForm(projectId, callback);
		},function(callback) {
			var experimentId= req.params.experiment_id;
			if(!experimentId)
				return callback(null, null);
			else
				models.Experiment.findOne({_id: experimentId}, callback);

		}], function( err, results) {
			var rev = results[0];
			var experiment = results[1];
			var value = experiment?experiment.revision: null;
			console.log("value rev: " + value);
			var form = forms.experiment(rev, value);
			if( experiment) 
				form = form.bind(experiment);
			res.render('experiment', {
				title: 'Experiment settings',
				form:  form.toHTML()
			});
		});
}

exports.project_experiment_new_post = function (req, res) {
	var projectId = req.params.id;
	create_revisionForm(projectId, function(err, form){
		models.Project.findOne({_id: projectId}, function(err, project){

			form.handle(req, { 
				success: function(form){

					var save = function(e, project)
					{
						async.parallel([
							function(callback) { e.save(callback); } , 
							function(callback) { project.save(callback); } , 
						],function(err, result){
							res.redirect(routing.project(projectId));
						});
					}
					var experimentId = req.params.experiment_id;
					if( !experimentId) 
					{
						var e = new models.Experiment(form.data);
						project.experiments.push(e);
						save(e, project);
					} else { 
						models.Experiment.findOne({_id: experimentId}, function(err, e){
							e.name = form.data.name;
							e.probability = form.data.probability;
							e.revision = form.data.revision;
							save(e, project);
						});
					}
				},error: function(form){ 
						res.redirect(routing.project(projectId));
				}
				,empty: function(form){ 
						res.redirect(routing.project(projectId));
				}
			});
		});
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
			res.redirect(routing.project(revision.project));
		});

	});
}
