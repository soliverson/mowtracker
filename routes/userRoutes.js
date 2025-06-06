const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// Dashboard
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobs(req.session.user.id, (err, jobs) => {
    if (err) return res.send('Error loading jobs');

    userModel.getCustomers(req.session.user.id, (err2, customers) => {
      if (err2) return res.send('Error loading customers');

      const now = new Date();
      const total = jobs.reduce((sum, job) => sum + parseFloat(job.amount_paid || 0), 0);

      const upcomingJobs = jobs
        .filter(job => new Date(`${job.date}T${job.time || '00:00'}`) >= now)
        .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

      res.render('dashboard', {
        user: req.session.user,
        jobs,
        total,
        upcomingJobs,
        customers
      });
    });
  });
});
// ✅ View all jobs for a specific customer name
router.get('/customers/:name', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const customerName = decodeURIComponent(req.params.name);

  userModel.getJobsByCustomer(req.session.user.id, customerName, (err, jobs) => {
    if (err) {
      console.error('Error loading jobs for customer:', err);
      return res.send('Error loading jobs for customer');
    }

    res.render('customer-jobs', { customerName, jobs });
  });
});

// Add Job from Dashboard
router.post('/add-job', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { customer_name, phone, notes, date, amount_paid, address } = req.body;

  userModel.addJob(
    req.session.user.id,
    customer_name,
    date,
    amount_paid,
    phone,
    notes,
    address,
    null,
    (err) => {
      if (err) return res.send('Error saving job');
      res.redirect('/');
    }
  );
});

// Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  userModel.authenticate(req.body.email, req.body.password, (err, user) => {
    if (err) return res.render('login', { error: 'Database error' });
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
    if (err) return res.render('register', { error: 'Email already exists or error occurred' });
    res.redirect('/login');
  });
});

// Add Customer
router.post('/add-customer', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { name, phone, address } = req.body;

  userModel.addCustomer(req.session.user.id, name, phone, address, (err) => {
    if (err) return res.send('Error saving customer');
    res.redirect('/');
  });
});

// Add Appointment
router.get('/add-appointment', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getCustomers(req.session.user.id, (err, customers) => {
    if (err) return res.send('Error loading customers');
    res.render('add-appointment', { user: req.session.user, customers });
  });
});

router.post('/add-appointment', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { customer_name, date, time, phone, notes, address, amount_paid } = req.body;

  userModel.addJob(
    req.session.user.id,
    customer_name,
    date,
    amount_paid || 0,
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

// Customers
router.get('/customers', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getCustomers(req.session.user.id, (err, customers) => {
    if (err) return res.send('Error loading customers');
    res.render('customers', { user: req.session.user, customers });
  });
});

router.get('/customers/:id/edit', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getCustomerById(req.session.user.id, req.params.id, (err, customer) => {
    if (err || !customer) return res.send('Error loading customer');
    res.render('edit-customer', { customer });
  });
});

router.post('/customers/:id/update', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { name, phone, address } = req.body;
  userModel.updateCustomer(req.session.user.id, req.params.id, name, phone, address, (err) => {
    if (err) return res.send('Error updating customer');
    res.redirect('/customers');
  });
});

router.post('/customers/:id/delete', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.deleteCustomer(req.session.user.id, req.params.id, (err) => {
    if (err) return res.send('Error deleting customer');
    res.redirect('/customers');
  });
});

// Calendar
router.get('/calendar', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobs(req.session.user.id, (err, jobs) => {
    if (err) return res.send('Error loading jobs');

    const now = new Date();
    const upcomingJobs = jobs
      .filter(job => new Date(`${job.date}T${job.time || '00:00'}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

    res.render('calendar', {
      user: req.session.user,
      upcomingJobs,
      jobs
    });
  });
});

// Payments
router.get('/payments', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobs(req.session.user.id, (err, jobs) => {
    if (err) return res.send('Error loading jobs');
    const total = jobs.reduce((sum, job) => sum + parseFloat(job.amount_paid || 0), 0);
    res.render('payments', { user: req.session.user, jobs, total });
  });
});

// Edit Job
router.get('/jobs/:id/edit', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.getJobById(req.session.user.id, req.params.id, (err, job) => {
    if (err || !job) return res.send('Error loading job');

    userModel.getCustomers(req.session.user.id, (err, customers) => {
      if (err) return res.send('Error loading customers');
      res.render('edit-job', { job, customers });
    });
  });
});

router.post('/jobs/:id/update', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { customer_name, date, time, phone, notes, address, amount_paid } = req.body;

  userModel.updateJob(
    req.session.user.id,
    req.params.id,
    customer_name,
    date,
    amount_paid,
    phone,
    notes,
    address,
    time,
    (err) => {
      if (err) return res.send('Error updating job');
      res.redirect('/');
    }
  );
});

router.post('/jobs/:id/delete', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  userModel.deleteJob(req.session.user.id, req.params.id, (err) => {
    if (err) return res.send('Error deleting job');
    res.redirect('back');
  });
});

// Reports page
router.get('/reports', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const userId = req.session.user.id;
  const now = new Date();

  const selectedMonth = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
  const startOfMonth = `${selectedYear}-${selectedMonthNum}-01`;
  const endOfMonth = new Date(selectedYear, selectedMonthNum, 0).toISOString().slice(0, 10);

  const selectedMonthLabel = new Date(`${selectedMonth}-01`).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  userModel.getJobs(userId, (err, jobs) => {
    if (err) return res.send('Error loading jobs');

const monthJobs = jobs.filter(job => {
  const jobDate = new Date(job.date);
  const start = new Date(startOfMonth);
  const end = new Date(endOfMonth);
  return jobDate >= start && jobDate <= end;
});


    const monthTotal = monthJobs.reduce((sum, job) => sum + parseFloat(job.amount_paid || 0), 0);

    const ytdJobs = jobs.filter(job =>
      new Date(job.date).getFullYear() === parseInt(selectedYear)
    );

    const ytdTotal = ytdJobs.reduce((sum, job) => sum + parseFloat(job.amount_paid || 0), 0);

    res.render('reports', {
      user: req.session.user,
      jobs: monthJobs,
      monthTotal,
      ytdTotal,
      selectedMonth,
      selectedMonthLabel
    });
  });
});

module.exports = router;
