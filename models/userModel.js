const db = require('./db');

// Register a new user
function register(name, email, password, callback) {
  db.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, password],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows[0]);
    }
  );
}

// Authenticate login
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

// Get all jobs for a user
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

// Add a new job
function addJob(user_id, customer_name, date, amount_paid, phone, notes, address, time, callback) {
  db.query(
    `INSERT INTO jobs (user_id, customer_name, date, amount_paid, phone, notes, address, time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [user_id, customer_name, date, amount_paid, phone, notes, address, time],
    callback
  );
}

// Get all jobs for a specific customer
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

// Delete a job by ID
function deleteJob(userId, jobId, callback) {
  db.query(
    'DELETE FROM jobs WHERE user_id = $1 AND id = $2',
    [userId, jobId],
    callback
  );
}

// Add a new customer
function addCustomer(user_id, name, phone, address, callback) {
  db.query(
    `INSERT INTO customers (user_id, name, phone, address)
     VALUES ($1, $2, $3, $4)`,
    [user_id, name, phone, address],
    callback
  );
}

// Get all customers for a user
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

// Delete a customer
function deleteCustomer(userId, customerName, callback) {
  db.query(
    'DELETE FROM customers WHERE user_id = $1 AND name = $2',
    [userId, customerName],
    callback
  );
}

// Update a customer
function updateCustomer(userId, oldName, newName, phone, address, callback) {
  db.query(
    'UPDATE customers SET name = $1, phone = $2, address = $3 WHERE user_id = $4 AND name = $5',
    [newName, phone, address, userId, oldName],
    callback
  );
}

module.exports = {
  register,
  authenticate,
  getJobs,
  addJob,
  getJobsByCustomer,
  deleteJob,
  addCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer
};
