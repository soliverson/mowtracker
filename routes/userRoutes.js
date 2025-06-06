const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const jobs = userModel.getJobs(req.session.user.id);
  const total = jobs.reduce((sum, job) => sum + job.amount_paid, 0);
  res.render('dashboard', { user: req.session.user, jobs, total });
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const user = userModel.authenticate(req.body.email, req.body.password);
  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', (req, res) => {
  const success = userModel.register(req.body.name, req.body.email, req.body.password);
  if (success) res.redirect('/login');
  else res.render('register', { error: 'Email already exists' });
});

router.post('/add-job', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  userModel.addJob(req.session.user.id, req.body.customer_name, req.body.date, parseFloat(req.body.amount_paid), req.body.phone, req.body.notes);
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
