
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express ' + req.user.username })
};

exports.login = function(req, res) {
  res.render('login', {title: 'Login' } );
}
