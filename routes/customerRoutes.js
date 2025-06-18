const express = require('express');
const router = express.Router();
const db = require('../models/db');
const checkAuth = require('../utilities/checkAuth');

// GET customer list
router.get('/', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const customers = await db.query(
    'SELECT * FROM customers WHERE user_id = $1 ORDER BY name',
    [userId]
  );
  res.render('customers', { customers: customers.rows, title: 'Customers' });
});

// GET customer details
router.get('/:id', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const customerId = req.params.id;

  const customer = await db.query('SELECT * FROM customers WHERE id = $1 AND user_id = $2', [
    customerId,
    userId
  ]);

  if (!customer.rows.length) {
    return res.status(404).send('Customer not found');
  }

  const jobs = await db.query(
    'SELECT * FROM jobs WHERE user_id = $1 AND customer_name = $2 ORDER BY date DESC',
    [userId, customer.rows[0].name]
  );

  const totalPaid = jobs.rows.reduce((sum, job) => sum + parseFloat(job.amount_paid || 0), 0);

  res.render('customer-details', {
    customer: customer.rows[0],
    jobs: jobs.rows,
    totalPaid: totalPaid.toFixed(2),
    title: `Customer: ${customer.rows[0].name}`
  });
});

// GET edit customer
router.get('/:id/edit', checkAuth, async (req, res) => {
  const customer = await db.query('SELECT * FROM customers WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.session.user.id
  ]);

  if (!customer.rows.length) {
    return res.status(404).send('Customer not found');
  }

  res.render('edit-customer', {
    customer: customer.rows[0],
    title: 'Edit Customer'
  });
});

// POST update customer
router.post('/:id/update', checkAuth, async (req, res) => {
  const { name, phone, address } = req.body;
  await db.query(
    'UPDATE customers SET name = $1, phone = $2, address = $3 WHERE id = $4 AND user_id = $5',
    [name, phone, address, req.params.id, req.session.user.id]
  );
  res.redirect('/customers');
});

// POST delete customer
router.post('/:id/delete', checkAuth, async (req, res) => {
  await db.query('DELETE FROM customers WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.session.user.id
  ]);
  res.redirect('/customers');
});

module.exports = router;
