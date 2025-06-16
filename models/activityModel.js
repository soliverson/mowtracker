// models/activityModel.js
const db = require('./db');

// Log a user activity
async function logActivity(userId, action) {
  const timestamp = new Date();
  return db.query(
    'INSERT INTO activity_log (user_id, action, timestamp) VALUES ($1, $2, $3)',
    [userId, action, timestamp]
  );
}

// Get all activity for a user
async function getUserActivity(userId) {
  const result = await db.query(
    'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY timestamp DESC',
    [userId]
  );
  return result.rows;
}

module.exports = {
  logActivity,
  getUserActivity
};
