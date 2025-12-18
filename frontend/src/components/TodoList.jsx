import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';
import useResponsive from '../hooks/useResponsive';
  
  

const TodoList = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, dueDate
  const { isMobile, isTablet, isDesktop } = useResponsive();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/todos');
      setTodos(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      setError('Failed to load todos. Please try again.');
      showNotification('error', 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) {
      showNotification('error', 'Please enter a todo title');
      return;
    }

    try {
      const todoData = {
        title: newTodo,
        description: description.trim(),
        dueDate: dueDate || null
      };

      const response = await axios.post('/api/todos', todoData);
      
      setTodos([response.data, ...todos]);
      setNewTodo('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      showNotification('success', 'Todo added successfully!');
    } catch (err) {
      console.error('Failed to add todo:', err);
      showNotification('error', 'Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await axios.put(`/api/todos/${id}`, {
        completed: !completed
      });
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
      
      const action = completed ? 'marked as incomplete' : 'completed';
      showNotification('success', `Todo ${action}!`);
    } catch (err) {
      console.error('Failed to update todo:', err);
      showNotification('error', 'Failed to update todo.');
    }
  };

  const deleteTodo = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      showNotification('success', 'Todo deleted successfully!');
    } catch (err) {
      console.error('Failed to delete todo:', err);
      showNotification('error', 'Failed to delete todo.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isOverdue = date < now && !isToday;
    
    return {
      display: isToday ? 'Today' : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }),
      isOverdue,
      isToday
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getFilteredAndSortedTodos = () => {
    let filtered = todos;
    
    // Filter
    if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });
    
    return filtered;
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const filteredTodos = getFilteredAndSortedTodos();

  if (loading) {
    return (
      <div className="todo-section">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-section fade-in">
      <div className="section-header">
        <div>
          <h2>My Todo List</h2>
          <p className="todo-count">
            {activeCount} active, {completedCount} completed • {todos.length} total
          </p>
        </div>
        
        <div className="todo-controls">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Todos</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          className="todo-title-input"
        />
        
        <div className="todo-extra-fields">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            className="todo-description-input"
          />
          
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="todo-date-input"
          />
          
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        
        <button type="submit" className="add-todo-btn">
          <span className="btn-icon">➕</span>
          Add Todo
        </button>
      </form>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No todos found</p>
          <p className="empty-subtext">
            {filter === 'all' 
              ? 'Start by adding your first todo above!'
              : filter === 'active'
              ? 'No active todos. Great job!'
              : 'No completed todos yet.'}
          </p>
        </div>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map(todo => {
            const dateInfo = formatDate(todo.dueDate);
            
            return (
              <li 
                key={todo.id} 
                className={`todo-item ${todo.completed ? 'completed' : ''} fade-in`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="todo-checkbox"
                />
                
                <div className="todo-content">
                  <div className="todo-header">
                    <h3>{todo.title}</h3>
                    <span className={`priority-indicator ${getPriorityColor(priority)}`}></span>
                  </div>
                  
                  {todo.description && (
                    <p className="todo-description">{todo.description}</p>
                  )}
                  
                  <div className="todo-meta">
                    {dateInfo.display && (
                      <span className={`todo-date ${dateInfo.isOverdue ? 'overdue' : ''}`}>
                        <span className="date-icon">📅</span>
                        {dateInfo.display}
                        {dateInfo.isOverdue && ' • Overdue!'}
                      </span>
                    )}
                    
                    <span className="todo-created">
                      <span className="created-icon">🕒</span>
                      Created: {new Date(todo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="todo-actions">
                  <button 
                    onClick={() => deleteTodo(todo.id, todo.title)}
                    className="delete-btn"
                    title="Delete todo"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Stats Footer */}
      <div className="todo-stats">
        <div className="stat">
          <span className="stat-value">{todos.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat">
          <span className="stat-value">{activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
          </span>
          <span className="stat-label">Progress</span>
        </div>
      </div>
    </div>
  );
};

export default TodoList;