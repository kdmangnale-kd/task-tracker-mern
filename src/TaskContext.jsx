import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

// ── State ─────────────────────────────────────────────────────────
const initialState = {
  tasks: [],
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  filters: { status: '', priority: '', sort: 'newest', search: '' },
};

// ── Reducer ──────────────────────────────────────────────────────
function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STATS_LOADING':
      return { ...state, statsLoading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false, error: null };
    case 'SET_STATS':
      return { ...state, stats: action.payload, statsLoading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === action.payload._id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t._id !== action.payload) };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────
const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      if (filters.sort && filters.sort !== 'newest') params.sort = filters.sort;

      const { data } = await taskAPI.getAll(params);
      dispatch({ type: 'SET_TASKS', payload: data.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    dispatch({ type: 'SET_STATS_LOADING', payload: true });
    try {
      const { data } = await taskAPI.getStats();
      dispatch({ type: 'SET_STATS', payload: data.data });
    } catch (err) {
      dispatch({ type: 'SET_STATS_LOADING', payload: false });
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const { data } = await taskAPI.create(taskData);
      dispatch({ type: 'ADD_TASK', payload: data.data });
      toast.success('Task created!');
      fetchStats();
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchStats]);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      const { data } = await taskAPI.update(id, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: data.data });
      toast.success('Task updated!');
      fetchStats();
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchStats]);

  const quickUpdateStatus = useCallback(async (id, status) => {
    try {
      const { data } = await taskAPI.updateStatus(id, status);
      dispatch({ type: 'UPDATE_TASK', payload: data.data });
      toast.success(`Moved to ${status.replace('-', ' ')}`);
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  }, [fetchStats]);

  const deleteTask = useCallback(async (id) => {
    try {
      await taskAPI.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      toast.success('Task deleted');
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  }, [fetchStats]);

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchTasks,
        fetchStats,
        createTask,
        updateTask,
        quickUpdateStatus,
        deleteTask,
        setFilters,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
