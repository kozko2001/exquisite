var forms = require('forms');

var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

exports.login = forms.create({
	  username: fields.string({required: true}),
	  password: fields.password({required: true})
  });

exports.project_new = forms.create({
		name: fields.string({require: true}),
		description: fields.string({widget: widgets.textarea({rows: 5, cols: 20}) })
});

exports.revision = forms.create({
	name: fields.string({require: true}),
	description: fields.string({require: false, widget: widgets.textarea({rows: 5, cols: 20}) }),
	payload: fields.string()
});

exports.experiment = function(revisions, value) {
	return forms.create({
		name: fields.string({require: true}),
		revision: fields.string({
			choices: revisions,
			value: value,
			widget: widgets.select()
		}),
		probability: fields.number({validators: [validators.min(0),  validators.max(100)]})
	});
}
