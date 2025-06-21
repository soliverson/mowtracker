const express = require('express');
const router = express.Router();

const checkAuth = require('../utilities/checkAuth');
const userController = require('../controllers/userController');
const { validateLogin } = require('../middleware/validate');
const activityModel = require('../models/activityModel');

/*------------------------------------------------------------
  Auth Routes
-------------------------------------------------------------*/

// Redirect root path to login
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login form submission
router.post('/login', validateLogin, userController.login);

// Show registration form
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration submission
router.post('/register', userController.register);

// Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.render('logout', { message: 'You have been logged out.' });
  });
});

/*------------------------------------------------------------
  Activity Log (Authenticated only)
-------------------------------------------------------------*/
router.get('/activity', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const activities = await activityModel.getUserActivity(req.session.user.id);
    res.render('activity', { user: req.session.user, activities });
  } catch (err) {
    console.error('Activity log error:', err);
    res.status(500).send('Error loading activity log.');
  }
});

module.exports = router;
