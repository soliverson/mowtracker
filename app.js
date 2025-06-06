const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'mowtracker_secret',
  resave: false,
  saveUninitialized: true
}));

app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
