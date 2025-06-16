
const express = require('express');
const router = express.Router();
const checkAuth = require('../utilities/checkAuth');

const userController = require('../controllers/userController');
const { validateLogin } = require('../middleware/validate');
const activityModel = require('../models/activityModel');
// Redirect root path to login
router.get('/', (req, res) => {
  res.redirect('/login');
});
// Show login form
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
router.post('/login', validateLogin, userController.login);

// Show activity page
router.get('/activity', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const activities = await activityModel.getUserActivity(req.session.user.id);
  res.render('activity', { user: req.session.user, activities });
});

// ❌ Removed dashboard redirect to prevent infinite loop

module.exports = router;
