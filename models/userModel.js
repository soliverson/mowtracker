/**
 * models/userModel.js
 * ----------------------------------------------------
 * All database‐level logic for users *plus* the legacy
 * job / customer helpers you already rely on.
 */
const db     = require('./db');
const bcrypt = require('bcryptjs');

/* ------------------------------------------------------------------
   USER AUTH / PROFILE
-------------------------------------------------------------------*/

/**
 * Create a user (password is hashed).
 * returns 1 row with id, name, email …
 */
async function register (name, email, password) {
  const hashed = await bcrypt.hash(password, 10);
  return db.query(
    'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *',
    [name, email, hashed]
  );
}

/** Update a user’s password (hashes internally) */
async function updatePassword (userId, plain) {
  const hashed = await bcrypt.hash(plain, 10);
  await db.query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [hashed, userId]
  );
}

/** Look up a user by e-mail – returns pg Result */
function findByEmail (email) {
  return db.query('SELECT * FROM users WHERE email = $1', [email]);
}

/* ------------------------------------------------------------------
   *Legacy* helpers you’re already using elsewhere
-------------------------------------------------------------------*/
function getJobs (userId, cb) {
  db.query(
    'SELECT * FROM jobs WHERE user_id = $1 ORDER BY date DESC',
    [userId],
    (err, result) => cb(err, result?.rows)
  );
}

function addJob (user_id, customer_name, date, amount_paid,
                 phone, notes, address, time, cb) {
  db.query(
    `INSERT INTO jobs (user_id, customer_name, date, amount_paid,
                       phone, notes, address, time)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [user_id, customer_name, date, amount_paid,
     phone, notes, address, time],
    cb
  );
}

function getJobsByCustomer (userId, customerName, cb) {
  db.query(
    'SELECT * FROM jobs WHERE user_id = $1 AND customer_name = $2 ORDER BY date DESC',
    [userId, customerName],
    (err, r) => cb(err, r?.rows)
  );
}

function deleteJob (userId, jobId, cb) {
  db.query(
    'DELETE FROM jobs WHERE user_id = $1 AND id = $2',
    [userId, jobId],
    cb
  );
}

/* ---------- Customers ---------- */
function addCustomer   (user_id, name, phone, address, cb) {
  db.query(
    'INSERT INTO customers (user_id, name, phone, address) VALUES ($1,$2,$3,$4)',
    [user_id, name, phone, address],
    cb
  );
}

function getCustomers  (userId, cb) {
  db.query(
    'SELECT * FROM customers WHERE user_id = $1 ORDER BY name',
    [userId],
    (err, r) => cb(err, r?.rows)
  );
}

function getCustomerById (userId, customerId, cb) {
  db.query(
    'SELECT * FROM customers WHERE id = $1 AND user_id = $2',
    [customerId, userId],
    (err, r) => cb(err, r?.rows[0])
  );
}

function updateCustomer (userId, customerId, name, phone, address, cb) {
  db.query(
    'UPDATE customers SET name=$1, phone=$2, address=$3 WHERE id=$4 AND user_id=$5',
    [name, phone, address, customerId, userId],
    cb
  );
}

function deleteCustomer (userId, customerId, cb) {
  db.query(
    'DELETE FROM customers WHERE id=$1 AND user_id=$2',
    [customerId, userId],
    cb
  );
}

/* ---------- Jobs CRUD helpers ---------- */
function getJobById (userId, jobId, cb) {
  db.query(
    'SELECT * FROM jobs WHERE id=$1 AND user_id=$2',
    [jobId, userId],
    (err, r) => cb(err, r?.rows[0])
  );
}

function updateJob (userId, jobId, customer_name, date,
                    amount_paid, phone, notes, address, time, cb) {
  db.query(
    `UPDATE jobs SET customer_name=$1, date=$2, amount_paid=$3, phone=$4,
                     notes=$5, address=$6, time=$7
     WHERE id=$8 AND user_id=$9`,
    [customer_name, date, amount_paid, phone, notes, address, time, jobId, userId],
    cb
  );
}

module.exports = {
  /* auth */
  register,
  updatePassword,
  findByEmail,
  /* legacy helpers */
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
