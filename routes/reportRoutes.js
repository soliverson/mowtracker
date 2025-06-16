// 📁 routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const checkAuth = require('../utilities/checkAuth');

const db = require('../models/db');

router.get('/', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const selectedMonth = req.query.month || new Date().toISOString().slice(0, 7);
  const [year, month] = selectedMonth.split('-');

  const jobs = await db.query(
    `SELECT * FROM jobs WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3`,
    [userId, year, month]
  );

  const ytd = await db.query(
    `SELECT COALESCE(SUM(amount_paid),0) AS total FROM jobs WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
    [userId, year]
  );

  const monthTotal = jobs.rows.reduce((sum, j) => sum + Number(j.amount_paid || 0), 0);
  const ytdTotal = parseFloat(ytd.rows[0].total);

  const selectedMonthLabel = new Date(`${selectedMonth}-01`).toLocaleString('default', {
    month: 'long', year: 'numeric'
  });

  res.render('reports', {
    selectedMonth,
    selectedMonthLabel,
    monthTotal,
    ytdTotal,
    jobs: jobs.rows
  });
});

module.exports = router;