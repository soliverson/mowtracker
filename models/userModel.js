const users = [];
const jobs = [];

function register(name, email, password) {
  if (users.find(u => u.email === email)) return false;
  const id = users.length + 1;
  users.push({ id, name, email, password });
  return true;
}

function authenticate(email, password) {
  return users.find(u => u.email === email && u.password === password);
}

function getJobs(userId) {
  return jobs.filter(j => j.user_id === userId);
}

function addJob(user_id, customer_name, date, amount_paid, phone, notes) {
  const id = jobs.length + 1;
  jobs.push({ id, user_id, customer_name, date, amount_paid, phone, notes });
}

module.exports = { register, authenticate, getJobs, addJob };
