// utilities/checkAuth.js
module.exports = function checkAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
