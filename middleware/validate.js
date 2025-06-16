function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Email and password are required.' });
  }
  next();
}

module.exports = { validateLogin };
