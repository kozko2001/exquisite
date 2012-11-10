var forms = require('forms');

var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

exports.login = forms.create({
	  username: fields.string({required: true}),
	  password: fields.password({required: true})
  });

exports.project_new = forms.create({
		project_name: fields.string({require: true})
	});

exports.revision = forms.create({
	name: fields.string({require: true}),
	description: fields.string({require: false}),
	payload: fields.string()
});
