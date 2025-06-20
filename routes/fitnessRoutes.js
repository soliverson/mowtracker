const express = require('express');
const router = express.Router();
const db = require('../models/db');
const checkAuth = require('../utilities/checkAuth');

// GET fitness dashboard
router.get('/', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const workouts = await db.query(
    `SELECT w.date, e.name AS exercise, we.reps, we.weight, we.distance, we.time
     FROM workouts w
     JOIN workout_entries we ON w.id = we.workout_id
     JOIN exercises e ON we.exercise_id = e.id
     WHERE w.user_id = $1
     ORDER BY w.date DESC
     LIMIT 7`,
    [userId]
  );
res.render('fitness/dashboard', { workouts: workouts.rows, title: 'Fitness Dashboard' });
});

// GET form to add workout
router.get('/add', checkAuth, async (req, res) => {
  const exercises = await db.query('SELECT * FROM exercises WHERE user_id = $1', [req.session.user.id]);
  res.render('fitness/add-workout', { exercises: exercises.rows, title: 'Add Workout' });
});

// POST add workout entry
router.post('/add', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const { date, exercise, reps, weight, distance, time } = req.body;

  // Ensure exercise exists or use default
  const exerciseResult = await db.query(
    'SELECT id FROM exercises WHERE user_id = $1 AND name = $2',
    [userId, exercise]
  );

  let exerciseId;
  if (exerciseResult.rows.length === 0) {
    const insertExercise = await db.query(
      'INSERT INTO exercises (user_id, name) VALUES ($1, $2) RETURNING id',
      [userId, exercise]
    );
    exerciseId = insertExercise.rows[0].id;
  } else {
    exerciseId = exerciseResult.rows[0].id;
  }

  // Create workout
  const workout = await db.query(
    'INSERT INTO workouts (user_id, date) VALUES ($1, $2) RETURNING id',
    [userId, date]
  );
  const workoutId = workout.rows[0].id;

  // Add workout entry
  await db.query(
    'INSERT INTO workout_entries (workout_id, exercise_id, reps, weight, distance, time) VALUES ($1, $2, $3, $4, $5, $6)',
    [workoutId, exerciseId, reps || null, weight || null, distance || null, time || null]
  );

  res.redirect('/fitness');
});

// GET workout history
router.get('/history', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const workouts = await db.query(
    `SELECT w.date, e.name AS exercise, we.reps, we.weight, we.distance, we.time
     FROM workouts w
     JOIN workout_entries we ON w.id = we.workout_id
     JOIN exercises e ON we.exercise_id = e.id
     WHERE w.user_id = $1
     ORDER BY w.date DESC`,
    [userId]
  );
  res.render('fitness/workout-history', { workouts: workouts.rows, title: 'Workout History' });
});

// GET weight tracker
router.get('/weight', checkAuth, async (req, res) => {
  const userId = req.session.user.id;
  const weights = await db.query(
    'SELECT date, weight FROM weight_entries WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );
  res.render('fitness/weight-tracker', { weights: weights.rows, title: 'Weight Tracker' });
});

// POST weight entry
router.post('/weight', checkAuth, async (req, res) => {
  const { date, weight } = req.body;
  const userId = req.session.user.id;

  await db.query(
    'INSERT INTO weight_entries (user_id, date, weight) VALUES ($1, $2, $3)',
    [userId, date, weight]
  );

  res.redirect('/fitness/weight');
});

// GET + POST for managing custom exercises
router.get('/exercises', checkAuth, async (req, res) => {
  const exercises = await db.query('SELECT * FROM exercises WHERE user_id = $1', [req.session.user.id]);
  res.render('fitness/exercises', { exercises: exercises.rows, title: 'Manage Exercises' });
});

router.post('/exercises', checkAuth, async (req, res) => {
  const { name } = req.body;
  await db.query('INSERT INTO exercises (user_id, name) VALUES ($1, $2)', [req.session.user.id, name]);
  res.redirect('/fitness/exercises');
});

module.exports = router;
