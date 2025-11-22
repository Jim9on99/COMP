require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Models
const User = require('./models/User');
const Task = require('./models/Task');

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow' }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Auth Middleware
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Routes
app.get('/', (req, res) => res.redirect('/tasks'));

// Register
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
  res.redirect('/login');
});

// Login
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id;
    return res.redirect('/tasks');
  }
  res.redirect('/login?error=1');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ==================== WEB CRUD (protected) ====================
app.get('/tasks', requireLogin, async (req, res) => {
  const query = req.query;
  let tasks = Task.find();

  // Bonus: diverse query conditions
  if (query.title) tasks = tasks.where('title').regex(new RegExp(query.title, 'i'));
  if (query.status) tasks = tasks.where('status').equals(query.status);
  if (query.priority) tasks = tasks.where('priority').equals(query.priority);
  if (query.dueDate) tasks = tasks.where('dueDate').lte(new Date(query.dueDate));

  tasks = await tasks.sort({ createdAt: -1 });
  res.render('index', { tasks, query });
});

app.get('/tasks/create', requireLogin, (req, res) => res.render('create'));
app.post('/tasks', requireLogin, async (req, res) => {
  await Task.create({ ...req.body, userId: req.session.userId });
  res.redirect('/tasks');
});

app.get('/tasks/edit/:id', requireLogin, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.userId.toString() !== req.session.userId.toString()) {
    return res.redirect('/tasks');
  }
  res.render('edit', { task });
});

app.post('/tasks/update/:id', requireLogin, async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/tasks');
});

app.post('/tasks/delete/:id', requireLogin, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/tasks');
});

// ==================== RESTful APIs (no auth required) ====================
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const result = await Task.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
