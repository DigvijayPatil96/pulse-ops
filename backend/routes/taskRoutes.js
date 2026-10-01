const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;
