import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: '',
};

const TaskForm = ({ task, onClose }) => {
  const { createTask, updateTask } = useTaskContext();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
        tags: task.tags?.join(', ') || '',
      });
    }
  }, [task]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 2) e.title = 'Title must be at least 2 characters';
    else if (form.title.trim().length > 100) e.title = 'Title cannot exceed 100 characters';
    if (form.description.length > 500) e.description = 'Description cannot exceed 500 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    const result = isEdit
      ? await updateTask(task._id, payload)
      : await createTask(payload);

    setSubmitting(false);
    if (result.success) onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
            <label htmlFor="title">Title <span className="required">*</span></label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              autoFocus
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
            <span className="char-count">{form.title.length}/100</span>
          </div>

          {/* Description */}
          <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Add details (optional)"
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
            <span className="char-count">{form.description.length}/500</span>
          </div>

          {/* Status + Priority row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags <span className="hint">(comma-separated)</span></label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="e.g. design, urgent, backend"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
