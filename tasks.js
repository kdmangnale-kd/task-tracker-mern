const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const Task = require('./Task');
const { asyncHandler } = require('./errorHandler');

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status value'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid date format'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── GET ALL TASKS ─────────────────────────────────────────────
// GET /api/tasks?status=&priority=&sort=&search=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, priority, sort, search } = req.query;
    const filter = {};

    if (status && ['todo', 'in-progress', 'completed'].includes(status)) {
      filter.status = status;
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'priority-high') sortOption = { priority: -1, createdAt: -1 };
    else if (sort === 'priority-low') sortOption = { priority: 1, createdAt: -1 };
    else if (sort === 'due-date') sortOption = { dueDate: 1 };
    else if (sort === 'title') sortOption = { title: 1 };

    const tasks = await Task.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  })
);

// ─── GET SINGLE TASK ────────────────────────────────────────────
// GET /api/tasks/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.status(200).json({ success: true, data: task });
  })
);

// ─── CREATE TASK ────────────────────────────────────────────────
// POST /api/tasks
router.post(
  '/',
  taskValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.create({ title, description, status, priority, dueDate, tags });
    res.status(201).json({ success: true, data: task, message: 'Task created successfully' });
  })
);

// ─── UPDATE TASK ────────────────────────────────────────────────
// PUT /api/tasks/:id
router.put(
  '/:id',
  taskValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    );
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.status(200).json({ success: true, data: task, message: 'Task updated successfully' });
  })
);

// ─── PATCH STATUS (quick toggle) ────────────────────────────────
// PATCH /api/tasks/:id/status
router.patch(
  '/:id/status',
  [body('status').isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status')],
  validate,
  asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.status(200).json({ success: true, data: task, message: 'Status updated' });
  })
);

// ─── DELETE TASK ────────────────────────────────────────────────
// DELETE /api/tasks/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully', data: { id: req.params.id } });
  })
);

// ─── GET STATS ──────────────────────────────────────────────────
// GET /api/tasks/meta/stats
router.get(
  '/meta/stats',
  asyncHandler(async (req, res) => {
    const [statusStats, priorityStats, total] = await Promise.all([
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments(),
    ]);

    const stats = {
      total,
      byStatus: { todo: 0, 'in-progress': 0, completed: 0 },
      byPriority: { low: 0, medium: 0, high: 0 },
    };

    statusStats.forEach((s) => { stats.byStatus[s._id] = s.count; });
    priorityStats.forEach((p) => { stats.byPriority[p._id] = p.count; });

    res.status(200).json({ success: true, data: stats });
  })
);

module.exports = router;
