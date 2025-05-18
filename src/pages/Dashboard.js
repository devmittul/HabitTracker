import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import HabitCard from '../components/HabitCard';

const Dashboard = () => {
  const { habits } = useHabits();
  const [todayHabits, setTodayHabits] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [quote, setQuote] = useState('');
  
  // Motivational quotes
  const quotes = [
    "Small daily improvements are the key to staggering long-term results.",
    "The only bad workout is the one that didn't happen.",
    "A habit cannot be tossed out the window; it must be coaxed down the stairs a step at a time.",
    "We first make our habits, and then our habits make us.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "Habits are the compound interest of self-improvement.",
    "Success is the sum of small efforts, repeated day in and day out."
  ];
  
  useEffect(() => {
    // Set random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    
    // Filter habits for today based on frequency
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = today.getDate();
    
    const filteredHabits = habits.filter(habit => {
      switch (habit.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          // If the habit is set to weekly (e.g., Monday), check if today matches
          return dayOfWeek === (habit.weeklyDay || 1); // Default to Monday
        case 'monthly':
          // If the habit is set to monthly (e.g., 1st of the month), check if today matches
          return dayOfMonth === (habit.monthlyDate || 1); // Default to 1st of month
        default:
          return true;
      }
    });
    
    setTodayHabits(filteredHabits);
    
    // Calculate completion rate
    if (filteredHabits.length > 0) {
      const todayStr = today.toISOString().split('T')[0];
      const completedCount = filteredHabits.filter(habit => 
        habit.history.some(entry => entry.date === todayStr && entry.completed)
      ).length;
      
      setCompletionRate(Math.round((completedCount / filteredHabits.length) * 100));
    }
    
    // Find longest streak
    if (habits.length > 0) {
      const maxStreak = Math.max(...habits.map(habit => habit.streak));
      setLongestStreak(maxStreak);
    }
  }, [habits]);
  
  return (
    <div className="dashboard-container animate-in">
      <h2 className="page-title">Today's Overview</h2>
      
      <div className="glass-card quote-card">
        <p className="quote">"{quote}"</p>
      </div>
      
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <h3>Today's Progress</h3>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${completionRate}%`,
                background: `linear-gradient(to right, var(--primary-color), var(--secondary-color))`
              }}
            ></div>
          </div>
          <p className="stat-value">{completionRate}% Complete</p>
        </div>
        
        <div className="glass-card stat-card">
          <h3>Total Habits</h3>
          <p className="stat-value">{habits.length}</p>
        </div>
        
        <div className="glass-card stat-card">
          <h3>Longest Streak</h3>
          <p className="stat-value">🔥 {longestStreak} days</p>
        </div>
      </div>
      
      <h2 className="section-title">Today's Habits</h2>
      
      {todayHabits.length > 0 ? (
        <div className="habits-grid">
          {todayHabits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <p>No habits for today. Add a new habit to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 