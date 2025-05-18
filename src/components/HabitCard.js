import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import ProgressBar from './ProgressBar';

const HabitCard = memo(({ habit }) => {
  const { toggleHabit, setProgress, deleteHabit } = useHabits();
  const [progress, setProgressValue] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // For swipe functionality
  const cardRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Get today's date string
  const today = new Date().toISOString().split('T')[0];
  
  // Find today's entry in habit history
  const todayEntry = habit.history?.find(entry => entry.date === today);
  const isCompleted = todayEntry && todayEntry.completed;
  
  // Set initial progress value based on today's entry
  useEffect(() => {
    if (todayEntry) {
      setProgressValue(todayEntry.value);
    } else {
      setProgressValue(0);
    }
  }, [todayEntry]);
  
  // Mobile swipe handlers
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  
  const handleTouchEnd = useCallback((e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  }, []);
  
  const handleSwipe = useCallback(() => {
    // Minimum swipe distance (in px)
    const minSwipeDistance = 75;
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    // If swipe right is detected
    if (swipeDistance < -minSwipeDistance) {
      // Quick complete action on swipe right
      if (!isCompleted) {
        handleComplete();
      }
    }
  }, [isCompleted]);
  
  // Click outside to close quick actions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleProgressChange = useCallback((value) => {
    setProgressValue(value);
    setProgress(habit.id, value);
    
    // Mark as completed if progress meets target
    if (value >= habit.target) {
      toggleHabit(habit.id, today, true, value);
    } else {
      toggleHabit(habit.id, today, false, value);
    }
  }, [habit.id, habit.target, setProgress, toggleHabit, today]);
  
  const handleIncrement = useCallback(() => {
    const newValue = Math.min(progress + 1, habit.target);
    handleProgressChange(newValue);
  }, [progress, habit.target, handleProgressChange]);
  
  const handleComplete = useCallback(() => {
    toggleHabit(habit.id, today, !isCompleted, isCompleted ? 0 : habit.target);
    setProgressValue(isCompleted ? 0 : habit.target);
    setShowQuickActions(false);
  }, [habit.id, habit.target, isCompleted, toggleHabit, today]);
  
  const confirmDelete = useCallback(() => {
    setShowDeleteConfirm(true);
    setShowQuickActions(false);
  }, []);
  
  const handleDelete = useCallback(() => {
    deleteHabit(habit.id);
    setShowDeleteConfirm(false);
  }, [deleteHabit, habit.id]);
  
  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);
  
  // Calculate progress percentage
  const progressPercentage = habit.target ? (progress / habit.target) * 100 : 0;
  
  if (!habit) {
    return null;
  }
  
  return (
    <div 
      ref={cardRef}
      className={`glass-card habit-card ${isCompleted ? 'completed' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="habit-category">{habit.category || 'Uncategorized'}</div>
      
      <button 
        className="delete-habit-btn" 
        onClick={confirmDelete}
        aria-label="Delete habit"
      >
        ×
      </button>
      
      <div className="habit-header">
        <div className="habit-icon">{habit.icon || '✓'}</div>
        <div>
          <h3 className="habit-title">{habit.title}</h3>
          <p className="habit-description">{habit.description || 'No description'}</p>
        </div>
      </div>
      
      <ProgressBar percentage={progressPercentage} color={habit.color || '#6d9ee1'} />
      
      <div className="habit-stats">
        <div className="habit-target">
          <span className="progress-value">{progress}</span> / <span>{habit.target}</span> {habit.unit || 'times'}
        </div>
        <div className="habit-streak">
          <span>🔥 {habit.streak || 0} day streak</span>
        </div>
      </div>
      
      <div className="habit-actions">
        <button 
          className="btn btn-secondary" 
          onClick={handleIncrement}
          disabled={isCompleted}
        >
          <span>+1 {habit.unit || 'time'}</span>
        </button>
        <button 
          className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`} 
          onClick={handleComplete}
        >
          <span>{isCompleted ? 'Undo' : 'Complete'}</span>
        </button>
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal glass-card">
            <h4>Delete Habit</h4>
            <p>Are you sure you want to delete "{habit.title}"? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

HabitCard.displayName = 'HabitCard';

export default HabitCard; 