import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';

const FilterBar = () => {
  const { filters, setFilters, fetchTasks } = useTaskContext();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: localSearch };
      setFilters({ search: localSearch });
      fetchTasks(newFilters);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch]); // eslint-disable-line

  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters({ [key]: value });
    fetchTasks(newFilters);
  };

  const clearAll = () => {
    const reset = { status: '', priority: '', sort: 'newest', search: '' };
    setLocalSearch('');
    setFilters(reset);
    fetchTasks(reset);
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.sort !== 'newest' || filters.search;

  return (
    <div className="filter-bar">
      {/* Search */}
      <div className="search-wrapper">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search tasks…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="search-input"
        />
        {localSearch && (
          <button className="btn-icon clear-search" onClick={() => setLocalSearch('')}>✕</button>
        )}
      </div>

      {/* Status Filter */}
      <select
        className="filter-select"
        value={filters.status}
        onChange={(e) => handleFilter('status', e.target.value)}
      >
        <option value="">All Status</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Priority Filter */}
      <select
        className="filter-select"
        value={filters.priority}
        onChange={(e) => handleFilter('priority', e.target.value)}
      >
        <option value="">All Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Sort */}
      <select
        className="filter-select"
        value={filters.sort}
        onChange={(e) => handleFilter('sort', e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="priority-high">Priority: High→Low</option>
        <option value="priority-low">Priority: Low→High</option>
        <option value="due-date">Due Date</option>
        <option value="title">Title A–Z</option>
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <button className="btn btn-ghost btn-sm" onClick={clearAll}>
          Clear filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
