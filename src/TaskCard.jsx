import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';

const PRIORITY_CONFIG = {
  high: { label: 'High', class: 'priority-high', icon: '⬆' },
  medium: { label: 'Medium', class: 'priority-medium', icon: '➡' },
  low: { label: 'Low', class: 'priority-low', icon: '⬇' },
};

const STATUS_NEXT = {
  todo: 'in-progress',
  'in-progress': 'completed',
  completed: 'todo',
};

const STATUS_LABEL = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isOverdue = (dateStr, status) => {
  if (!dateStr || status === 'completed') return false;
  return new Date(dateStr) < new Date();
};

const TaskCard = ({ task, onEdit }) => {
  const { deleteTask, quickUpdateStatus } = useTaskContext();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const overdue = isOverdue(task.dueDate, task.status);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await deleteTask(task._id);
  };

  const handleStatusCycle = () => {
    quickUpdateStatus(task._id, STATUS_NEXT[task.status]);
  };

  return (
    <div className={`task-card ${task.status === 'completed' ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}>
      {/* Priority stripe */}
      <div className={`priority-stripe ${priorityConf.class}`} />

      <div className="task-card-body">
        {/* Header row */}
        <div className="task-card-header">
          <button
            className={`status-badge status-${task.status}`}
            onClick={handleStatusCycle}
            title={`Click to move to ${STATUS_NEXT[task.status].replace('-', ' ')}`}
          >
            {task.status === 'completed' ? '✓' : task.status === 'in-progress' ? '●' : '○'}
            {' '}{STATUS_LABEL[task.status]}
          </button>

          <div className="task-card-actions">
            <button
              className="btn-icon btn-edit"
              onClick={() => onEdit(task)}
              title="Edit task"
            >✎</button>
            <button
              className={`btn-icon btn-delete ${confirmDelete ? 'confirm' : ''}`}
              onClick={handleDelete}
              disabled={deleting}
              title={confirmDelete ? 'Click again to confirm delete' : 'Delete task'}
              onBlur={() => setConfirmDelete(false)}
            >
              {deleting ? '…' : confirmDelete ? '!' : '✕'}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="task-title">{task.title}</h3>

        {/* Description */}
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, i) => (
              <span key={i} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="task-card-footer">
          <span className={`priority-badge ${priorityConf.class}`}>
            {priorityConf.icon} {priorityConf.label}
          </span>
          {task.dueDate && (
            <span className={`due-date ${overdue ? 'overdue-text' : ''}`}>
              {overdue ? '⚠ ' : '📅 '}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
