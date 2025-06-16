const db = require('./db');
const bcrypt = require('bcryptjs');

// Register a new user (with hashed password)
async function register(name, email, password, callback) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );
    callback(null, result.rows[0]);
  } catch (err) {
    callback(err);
  }
}

// Update password for a user by ID
async function updatePassword(userId, plainTextPassword, callback) {
  try {
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
    await db.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
    callback(null, true);
  } catch (err) {
    callback(err);
  }
}

// Authenticate login (legacy plain-text method)
function authenticate(email, password, callback) {
  db.query(
    'SELECT * FROM users WHERE email = $1 AND password = $2',
    [email, password],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows[0]);
    }
  );
}

// Find user by email (used by login controller)
async function findByEmail(email) {
  return db.query('SELECT * FROM users WHERE email = $1', [email]);
}

// Job and customer functions (unchanged)
function getJobs(userId, callback) {
  db.query(
    'SELECT * FROM jobs WHERE user_id = $1 ORDER BY date DESC',
    [userId],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    }
  );
}

function addJob(user_id, customer_name, date, amount_paid, phone, notes, address, time, callback) {
  db.query(
    `INSERT INTO jobs (user_id, customer_name, date, amount_paid, phone, notes, address, time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [user_id, customer_name, date, amount_paid, phone, notes, address, time],
    callback
  );
}

function getJobsByCustomer(userId, customerName, callback) {
  db.query(
    'SELECT * FROM jobs WHERE user_id = $1 AND customer_name = $2 ORDER BY date DESC',
    [userId, customerName],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    }
  );
}

function deleteJob(userId, jobId, callback) {
  db.query(
    'DELETE FROM jobs WHERE user_id = $1 AND id = $2',
    [userId, jobId],
    callback
  );
}

function addCustomer(user_id, name, phone, address, callback) {
  db.query(
    `INSERT INTO customers (user_id, name, phone, address)
     VALUES ($1, $2, $3, $4)`,
    [user_id, name, phone, address],
    callback
  );
}

function getCustomers(userId, callback) {
  db.query(
    'SELECT * FROM customers WHERE user_id = $1 ORDER BY name',
    [userId],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    }
  );
}

function getCustomerById(userId, customerId, callback) {
  db.query(
    'SELECT * FROM customers WHERE id = $1 AND user_id = $2',
    [customerId, userId],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows[0]);
    }
  );
}

function updateCustomer(userId, customerId, name, phone, address, callback) {
  db.query(
    'UPDATE customers SET name = $1, phone = $2, address = $3 WHERE id = $4 AND user_id = $5',
    [name, phone, address, customerId, userId],
    callback
  );
}

function deleteCustomer(userId, customerId, callback) {
  db.query(
    'DELETE FROM customers WHERE id = $1 AND user_id = $2',
    [customerId, userId],
    callback
  );
}

function getJobById(userId, jobId, callback) {
  db.query(
    'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
    [jobId, userId],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows[0]);
    }
  );
}

function updateJob(userId, jobId, customer_name, date, amount_paid, phone, notes, address, time, callback) {
  db.query(
    `UPDATE jobs SET customer_name = $1, date = $2, amount_paid = $3,
     phone = $4, notes = $5, address = $6, time = $7
     WHERE id = $8 AND user_id = $9`,
    [customer_name, date, amount_paid, phone, notes, address, time, jobId, userId],
    callback
  );
}

module.exports = {
  register,
  updatePassword,
  authenticate,
  findByEmail,
  getJobs,
  addJob,
  getJobsByCustomer,
  deleteJob,
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getJobById,
  updateJob
};
