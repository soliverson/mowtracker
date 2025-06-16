// 📁 routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const checkAuth = require('../utilities/checkAuth');
const db = require('../models/db');

// GET Calendar Page
router.get('/', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const showPast = req.query.showPast === 'true';
  const today = new Date();
  today.setDate(today.getDate() - 1);

  try {
    const jobsQuery = showPast
      ? 'SELECT * FROM jobs WHERE user_id = $1 ORDER BY date ASC'
      : 'SELECT * FROM jobs WHERE user_id = $1 AND date >= $2 ORDER BY date ASC';

    const jobs = showPast
      ? await db.query(jobsQuery, [userId])
      : await db.query(jobsQuery, [userId, today]);

    const customers = await db.query('SELECT * FROM customers WHERE user_id = $1 ORDER BY name', [userId]);

    res.render('calendar', {
      jobs: jobs.rows,
      customers: customers.rows,
      showPast,
      title: 'Calendar',
      includeCalendarCSS: true
    });
  } catch (err) {
    console.error('Error loading calendar:', err.message);
    res.status(500).send('Error loading calendar');
  }
});

// GET Add Appointment Form
router.get('/add-appointment', checkAuth, async (req, res) => {
  try {
    const customers = await db.query(
      'SELECT * FROM customers WHERE user_id = $1 ORDER BY name',
      [req.session.user.id]
    );
    res.render('add-appointment', {
      customers: customers.rows,
      selectedCustomer: req.query.customer || '',
      title: 'Add Appointment'
    });
  } catch (err) {
    console.error('Error loading add-appointment page:', err.message);
    res.status(500).send('Could not load appointment page');
  }
});

// POST Add Appointment
router.post('/add-appointment', checkAuth, async (req, res) => {
  const { customer_name, phone, date, time, notes, address, amount_paid, recurring, recurring_weeks } = req.body;

  try {
    const parts = date.split('-');
    const originalDate = new Date(parts[0], parts[1] - 1, parts[2]); // Parse local date
    const weeks = parseInt(recurring_weeks) || 0;

    for (let i = 0; i <= weeks; i++) {
      const apptDate = new Date(originalDate);
      apptDate.setDate(originalDate.getDate() + i * 7); // Add weeks safely

      await db.query(
        `INSERT INTO jobs (user_id, customer_name, date, time, phone, notes, address, amount_paid)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          req.session.user.id,
          customer_name,
          apptDate,
          time || null,
          phone || null,
          notes || null,
          address || null,
          amount_paid || 0
        ]
      );
    }

    res.redirect('/calendar');
  } catch (err) {
    console.error('Error scheduling appointment:', err.message);
    res.status(500).send('Error scheduling appointment');
  }
});

// GET Edit Job Form
router.get('/jobs/:id/edit', checkAuth, async (req, res) => {
  const jobId = req.params.id;
  const userId = req.session.user.id;

  try {
    const job = await db.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [jobId, userId]);
    const customers = await db.query('SELECT * FROM customers WHERE user_id = $1 ORDER BY name', [userId]);

    res.render('edit-job', {
      job: job.rows[0],
      customers: customers.rows,
      title: 'Edit Job'
    });
  } catch (err) {
    console.error('Error loading job edit page:', err.message);
    res.status(500).send('Error loading job edit page');
  }
});

// POST Update Job with Recurring Option
router.post('/jobs/:id/update', checkAuth, async (req, res) => {
  const jobId = req.params.id;
  const {
    customer_name,
    date,
    time,
    amount_paid,
    phone,
    notes,
    address,
    is_recurring,
    recurring_weeks
  } = req.body;

  try {
    const userId = req.session.user.id;

    // Update original job
    await db.query(
      `UPDATE jobs SET
        customer_name = $1,
        date = $2,
        time = $3,
        amount_paid = $4,
        phone = $5,
        notes = $6,
        address = $7
      WHERE id = $8 AND user_id = $9`,
      [customer_name, date, time, amount_paid, phone, notes, address, jobId, userId]
    );

    // Handle recurring jobs if selected
    if (is_recurring && recurring_weeks) {
      const parts = date.split('-');
      const originalDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const weeks = parseInt(recurring_weeks);

      for (let i = 1; i <= weeks; i++) {
        const apptDate = new Date(originalDate);
        apptDate.setDate(originalDate.getDate() + i * 7);

        await db.query(
          `INSERT INTO jobs (user_id, customer_name, date, time, phone, notes, address, amount_paid)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userId,
            customer_name,
            apptDate,
            time || null,
            phone || null,
            notes || null,
            address || null,
            amount_paid || 0
          ]
        );
      }
    }

    res.redirect('/calendar');
  } catch (err) {
    console.error('Error updating job:', err.message);
    res.status(500).send('Error updating job');
  }
});

// POST Delete Job
router.post('/jobs/:id/delete', checkAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM jobs WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id]);
    res.redirect('/calendar');
  } catch (err) {
    console.error('Error deleting job:', err.message);
    res.status(500).send('Error deleting job');
  }
});

module.exports = router;
