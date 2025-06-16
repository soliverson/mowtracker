const express = require('express');
const router = express.Router();
const db = require('../models/db');
const checkAuth = require('../utilities/checkAuth');

router.get('/', checkAuth, checkAuth, async (req, res) => {
  const result = await db.query(
    'SELECT * FROM jobs WHERE user_id = $1 AND amount_paid IS NOT NULL ORDER BY date DESC',
    [req.session.user.id]
  );
  res.render('payment', { user: req.session.user, jobs: result.rows });
});

module.exports = router;
