const express = require('express'); 
const router = express.Router();
const db = require('../models/db');
const checkAuth = require('../utilities/checkAuth');

router.get('/', checkAuth, async (req, res) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      console.error('No user session found');
      return res.status(401).send('Unauthorized');
    }

    const incomeResult = await db.query(
      'SELECT SUM(amount_paid) AS total FROM jobs WHERE user_id = $1',
      [userId]
    );
    const total = parseFloat(incomeResult.rows[0].total) || 0;

    const jobsResult = await db.query(
      `SELECT date, time, customer_name
       FROM jobs
       WHERE user_id = $1 AND date >= CURRENT_DATE
       ORDER BY date ASC
       LIMIT 5`,
      [userId]
    );
    const upcomingJobs = jobsResult.rows;

    res.render('dashboard', {
      user: req.session.user,
      total,
      upcomingJobs
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
