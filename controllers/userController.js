const userModel = require('../models/userModel');
const activityModel = require('../models/activityModel');
const bcrypt = require('bcryptjs');

async function login(req, res) {
  const { email, password } = req.body;
  const result = await userModel.findByEmail(email);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { error: 'Invalid credentials' });
  }

  req.session.user = { id: user.id, name: user.name };

  // Log the login event
  await activityModel.logActivity(user.id, 'User logged in');

  res.redirect('/dashboard');
}

module.exports = { login };
