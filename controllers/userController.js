const userModel = require('../models/userModel');
const activityModel = require('../models/activityModel');
const bcrypt = require('bcryptjs');

async function login(req, res) {
  const { email, password } = req.body;
  console.log('🔐 Login attempt for:', email);

  try {
    const result = await userModel.findByEmail(email);
    const user = result.rows[0];

    if (!user) {
      console.log('❌ User not found');
      return res.render('login', { error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('🔍 Password match:', match);

    if (!match) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    // Save session
    req.session.user = { id: user.id, name: user.name };
    console.log('✅ Login successful:', req.session.user);

    await activityModel.logActivity(user.id, 'User logged in');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('login', { error: 'Server error' });
  }
}

async function register(req, res) {
  const { name, email, password } = req.body;
  console.log('📝 Registration attempt for:', email);

  try {
    const existing = await userModel.findByEmail(email);
    if (existing.rows.length > 0) {
      return res.render('register', { error: 'Email already exists' });
    }

    const result = await userModel.register(name, email, password);
    const user = result.rows[0];

    req.session.user = { id: user.id, name: user.name };
    console.log('✅ Registration successful:', req.session.user);

    await activityModel.logActivity(user.id, 'User registered');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).render('register', { error: 'Server error' });
  }
}

module.exports = { login, register };
