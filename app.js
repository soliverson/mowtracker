const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // ✅ Load routes AFTER defining app

const app = express(); // ✅ Must come before using app.*

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'mowtracker_secret',
  resave: false,
  saveUninitialized: true
}));

app.use('/', userRoutes); // ✅ Use routes after all middleware setup

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
