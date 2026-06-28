import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTaskContext } from './TaskContext';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import './App.css';

// ── Inner App (needs context) ─────────────────────────────────────
const TaskApp = () => {
  const { tasks, loading, filters, fetchTasks, fetchStats } = useTaskContext();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Initial fetch
  useEffect(() => {
    fetchTasks(filters);
    fetchStats();
  }, []); // eslint-disable-line

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">◈</span>
            <div>
              <h1 className="brand-name">TaskFlow</h1>
              <p className="brand-tagline">Stay focused, ship faster</p>
            </div>
          </div>
          <button className="btn btn-primary btn-new" onClick={handleNewTask}>
            <span>+</span> New Task
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Stats */}
        <StatsBar />

        {/* Filters */}
        <FilterBar />

        {/* Task Grid */}
        <div className="task-section">
          {loading ? (
            <div className="task-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="task-card skeleton-card" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">◎</span>
              <h3>No tasks found</h3>
              <p>
                {filters.status || filters.priority || filters.search
                  ? 'No tasks match your current filters.'
                  : 'Create your first task to get started.'}
              </p>
              {!filters.status && !filters.priority && !filters.search && (
                <button className="btn btn-primary" onClick={handleNewTask}>
                  + Create Task
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="task-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
              <div className="task-grid">
                {tasks.map((task) => (
                  <TaskCard key={task._id} task={task} onEdit={handleEdit} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {showForm && (
        <TaskForm task={editingTask} onClose={handleCloseForm} />
      )}

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid #2d3748',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#68d391', secondary: '#1a1a2e' } },
          error: { iconTheme: { primary: '#fc8181', secondary: '#1a1a2e' } },
        }}
      />
    </div>
  );
};

// ── Root App ──────────────────────────────────────────────────────
function App() {
  return (
    <TaskProvider>
      <TaskApp />
    </TaskProvider>
  );
}

export default App;
