const express = require('express');
const router = express.Router();
const db = require('../models/db');
const checkAuth = require('../utilities/checkAuth');

// GET /expenses - display all expenses
router.get('/', checkAuth, async (req, res) => {
  const userId = req.session.user.id;

  const result = await db.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );

  const total = result.rows.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  res.render('expenses', {
    expenses: result.rows,
    total: total.toFixed(2),
    title: 'Expenses'
  });
});

// POST /expenses/add - add a new expense
router.post('/add', checkAuth, async (req, res) => {
const { category, description, amount, date } = req.body;
  const userId = req.session.user.id;

  await db.query(
  'INSERT INTO expenses (user_id, category, description, amount, date) VALUES ($1, $2, $3, $4, $5)',
  [userId, category, description, amount, date]
);


  res.redirect('/expenses');
});
// POST /expenses/:id/delete - delete an expense
router.post('/:id/delete', checkAuth, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.session.user.id;

  await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [
    expenseId,
    userId
  ]);

  res.redirect('/expenses');
});
// GET /expenses/:id/edit - show edit form
router.get('/:id/edit', checkAuth, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.session.user.id;

  const result = await db.query(
    'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
    [expenseId, userId]
  );

  if (result.rows.length === 0) {
    return res.redirect('/expenses');
  }

  res.render('edit-expense', {
    expense: result.rows[0],
    title: 'Edit Expense'
  });
});

// POST /expenses/:id/update - handle update
router.post('/:id/update', checkAuth, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.session.user.id;
  const { category, description, amount, date } = req.body;

  await db.query(
    'UPDATE expenses SET category = $1, description = $2, amount = $3, date = $4 WHERE id = $5 AND user_id = $6',
    [category, description, amount, date, expenseId, userId]
  );

  res.redirect('/expenses');
});

module.exports = router;
