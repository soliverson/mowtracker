// 📁 routes/customerRoutes.js
const express = require('express');
const router = express.Router();

const db = require('../models/db');
const checkAuth = require('../utilities/checkAuth');

// Show all customers
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT customer_name AS name, phone, address, MIN(id) AS id
       FROM jobs WHERE user_id = $1 GROUP BY customer_name, phone, address ORDER BY customer_name`,
      [req.session.user.id]
    );
    res.render('customers', { customers: result.rows });
  } catch (err) {
    console.error('Customer route error:', err.message);
    res.status(500).send('Server error');
  }
});

// Show single customer details + job form
router.get('/:name', checkAuth, async (req, res) => {
  const customerName = decodeURIComponent(req.params.name);
  const userId = req.session.user.id;

  try {
    const jobs = await db.query(
      `SELECT * FROM jobs WHERE user_id = $1 AND customer_name = $2 ORDER BY date DESC`,
      [userId, customerName]
    );

    const totalPaid = jobs.rows.reduce((sum, job) => sum + Number(job.amount_paid || 0), 0);
    const customer = jobs.rows[0] || { customer_name: customerName, phone: '', address: '' };

    res.render('customer-details', {
      customer,
      jobs: jobs.rows,
      totalPaid: totalPaid.toFixed(2),
    });
  } catch (err) {
    console.error('Error loading customer details:', err.message);
    res.status(500).send('Error loading customer details');
  }
});

// Update customer phone/address
router.post('/:name/update', checkAuth, async (req, res) => {
  const customerName = decodeURIComponent(req.params.name);
  const { phone, address } = req.body;
  try {
    await db.query(
      `UPDATE jobs SET phone = $1, address = $2 WHERE customer_name = $3 AND user_id = $4`,
      [phone, address, customerName, req.session.user.id]
    );
    res.redirect(`/customers/${encodeURIComponent(customerName)}`);
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).send('Failed to update customer');
  }
});

// Schedule new job for customer
router.post('/:name/add-job', checkAuth, async (req, res) => {
  const customerName = decodeURIComponent(req.params.name);
  const { date, time, amount_paid, phone, address, notes } = req.body;
  try {
    await db.query(
      `INSERT INTO jobs (user_id, customer_name, date, time, amount_paid, phone, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [req.session.user.id, customerName, date, time, amount_paid, phone, address, notes]
    );
    res.redirect(`/customers/${encodeURIComponent(customerName)}`);
  } catch (err) {
    console.error('Error adding job:', err.message);
    res.status(500).send('Failed to add job');
  }
});

module.exports = router;
