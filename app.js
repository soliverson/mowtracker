const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const db = require('./models/db'); // pg Pool
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expensesRoutes = require('./routes/expensesRoutes');
const fitnessRoutes = require('./routes/fitnessRoutes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // views/layout.ejs

// ✅ Correct session config — using pgSession
app.use(session({
  store: new pgSession({
    pool: db,
    tableName: 'user_sessions'
  }),
  secret: 'mowtracker_secret',
  resave: false,
  saveUninitialized: false,
cookie: {
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production' // only over HTTPS
}

}));

// Routes
app.use('/', userRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/customers', customerRoutes);
app.use('/calendar', calendarRoutes);
app.use('/payments', paymentRoutes);
app.use('/reports', reportRoutes);
app.use('/expenses', expensesRoutes);
app.use('/fitness', fitnessRoutes);

// Health check
app.get('/status', (req, res) => res.json({ status: 'ok' }));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
app.get('/test-session', (req, res) => {
  if (req.session.user) {
    res.send(`Session active: ${JSON.stringify(req.session.user)}`);
  } else {
    res.send('No session found.');
  }
});
