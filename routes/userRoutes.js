const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// Dashboard (main route)
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobs(req.session.user.id, (err, jobs) => {
    if (err) return res.send('Error loading jobs');

    const now = new Date();

    const total = jobs.reduce((sum, job) => sum + parseFloat(job.amount_paid || 0), 0);

    const upcomingJobs = jobs
      .filter(job => new Date(`${job.date}T${job.time || '00:00'}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

    res.render('dashboard', {
      user: req.session.user,
      jobs,
      total,
      upcomingJobs
    });
  });
});




// Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  userModel.authenticate(req.body.email, req.body.password, (err, user) => {
    if (err) {
      console.error('Login error:', err);
      return res.render('login', { error: 'Database error' });
    }
    if (user) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  });
});

// Register
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', (req, res) => {
  userModel.register(req.body.name, req.body.email, req.body.password, (err, user) => {
    if (err) {
      return res.render('register', { error: 'Email already exists or error occurred' });
    }
    res.redirect('/login');
  });
});
// Add Customer
router.post('/add-customer', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { name, phone, address } = req.body;

  userModel.addCustomer(req.session.user.id, name, phone, address, (err) => {
    if (err) {
      console.error('Error adding customer:', err);
      return res.send('Error saving customer');
    }
    res.redirect('/');
  });
});
// Add Job
router.post('/add-appointment', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { customer_name, date, time, phone, notes, address } = req.body;

  userModel.addJob(
    req.session.user.id,
    customer_name,
    date,
    0, // No payment shown/saved
    phone,
    notes,
    address,
    time,
    (err) => {
      if (err) return res.send('Error saving appointment');
      res.redirect('/calendar');
    }
  );
});


// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Customers page
router.get('/customers', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getCustomers(req.session.user.id, (err, customers) => {
    if (err) {
      console.error('Error loading customers:', err);
      return res.send('Error loading customers');
    }
    res.render('customers', { user: req.session.user, customers });
  });
});
router.get('/customers/:name', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const customerName = decodeURIComponent(req.params.name);

  userModel.getJobsByCustomer(req.session.user.id, customerName, (err, jobs) => {
    if (err) return res.send('Error loading jobs for customer');
    res.render('customer-jobs', { customerName, jobs });
  });
});
// View all jobs for a customer
router.get('/customer/:name', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobsByCustomer(req.session.user.id, req.params.name, (err, jobs) => {
    if (err) return res.send('Error loading customer jobs');
    res.render('customer-jobs', { customerName: req.params.name, jobs });
  });
});

// Calendar view
router.get('/calendar', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobs(req.session.user.id, (err, jobs) => {
    if (err) return res.send('Error loading jobs');
   const now = new Date();
 
const upcomingJobs = jobs
  .filter(job => {
    const jobDateTime = new Date(`${job.date}T${job.time || '00:00'}`);
    return jobDateTime.getTime() >= now.getTime();
  })
  .sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const bTime = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return aTime - bTime;
  });

  });
});

// Payments view
router.get('/payments', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobs(req.session.user.id, (err, jobs) => {
    if (err) return res.send('Error loading jobs');
    const total = jobs.reduce((sum, job) => sum + parseFloat(job.amount_paid), 0);
    res.render('payments', { user: req.session.user, jobs, total });
  });
});
// Delete job by ID
router.post('/jobs/:id/delete', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const jobId = req.params.id;

  userModel.deleteJob(req.session.user.id, jobId, (err) => {
    if (err) {
      console.error('Failed to delete job:', err);
      return res.send('Error deleting job');
    }
    res.redirect('back'); // refresh the current page
  });
});

module.exports = router;
