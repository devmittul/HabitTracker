import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';

const Statistics = () => {
  const { habits } = useHabits();
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Generate month options for select
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Generate options for the last 12 months
    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      
      options.push({ value, label });
    }
    
    return options;
  };
  
  const monthOptions = getMonthOptions();
  
  useEffect(() => {
    if (habits.length === 0) return;
    
    // Calculate monthly completion data
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Generate daily data for the selected month
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Filter habits that should be active on this date
      const activeHabits = habits.filter(habit => {
        const habitDate = new Date(date);
        const dayOfWeek = habitDate.getDay();
        const dayOfMonth = habitDate.getDate();
        
        switch (habit.frequency) {
          case 'daily':
            return true;
          case 'weekly':
            return dayOfWeek === (habit.weeklyDay || 1);
          case 'monthly':
            return dayOfMonth === (habit.monthlyDate || 1);
          default:
            return true;
        }
      });
      
      // Count completed habits for this date
      const completedCount = activeHabits.filter(habit => 
        habit.history.some(entry => entry.date === date && entry.completed)
      ).length;
      
      // Calculate completion percentage
      const percentage = activeHabits.length > 0 
        ? Math.round((completedCount / activeHabits.length) * 100) 
        : 0;
      
      dailyData.push({
        date,
        day,
        activeHabits: activeHabits.length,
        completed: completedCount,
        percentage
      });
    }
    
    setMonthlyData(dailyData);
    
    // Calculate stats by category
    const categories = {};
    
    habits.forEach(habit => {
      const category = habit.category;
      
      if (!categories[category]) {
        categories[category] = {
          name: category,
          count: 0,
          completed: 0,
          streakSum: 0
        };
      }
      
      categories[category].count++;
      categories[category].streakSum += habit.streak;
      
      // Count completions in the selected month
      habit.history.forEach(entry => {
        if (entry.date.startsWith(selectedMonth) && entry.completed) {
          categories[category].completed++;
        }
      });
    });
    
    setCategoryData(Object.values(categories));
    
    // Set default selected habit
    if (!selectedHabit && habits.length > 0) {
      setSelectedHabit(habits[0].id);
    }
  }, [habits, selectedMonth, selectedHabit]);
  
  // Get selected habit data
  const habitData = selectedHabit 
    ? habits.find(habit => habit.id === selectedHabit) 
    : null;
  
  return (
    <div className="statistics-container animate-in">
      <h2 className="page-title">Statistics & Analytics</h2>
      
      <div className="stats-controls glass-card">
        <div className="control-group">
          <label htmlFor="month-select">Month</label>
          <select 
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="habit-select">Habit</label>
          <select
            id="habit-select"
            value={selectedHabit || ''}
            onChange={(e) => setSelectedHabit(Number(e.target.value))}
          >
            {habits.map(habit => (
              <option key={habit.id} value={habit.id}>
                {habit.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <h3>Monthly Overview</h3>
          <div className="calendar-heatmap">
            {monthlyData.map((day) => (
              <div 
                key={day.date} 
                className="heatmap-day"
                style={{ 
                  backgroundColor: day.percentage > 0 
                    ? `rgba(176, 224, 168, ${day.percentage / 100})` 
                    : 'transparent',
                  border: '1px solid var(--glass-border)'
                }}
                title={`${day.date}: ${day.percentage}% completed`}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-card stat-card">
          <h3>Categories</h3>
          <div className="categories-stats">
            {categoryData.map(category => (
              <div key={category.name} className="category-stat">
                <div className="category-name">{category.name}</div>
                <div className="category-bar">
                  <div 
                    className="category-progress"
                    style={{ 
                      width: `${(category.completed / (category.count * 30)) * 100}%`,
                      background: `var(--${category.name.toLowerCase() === 'health' ? 'primary-color' : 
                                        category.name.toLowerCase() === 'productivity' ? 'secondary-color' : 
                                        category.name.toLowerCase() === 'wellness' ? 'accent-color' : 
                                        'success-color'})` 
                    }}
                  ></div>
                </div>
                <div className="category-metrics">
                  <span>{category.count} habits</span>
                  <span>Avg streak: {Math.round(category.streakSum / category.count)} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {habitData && (
        <div className="glass-card habit-stats-card">
          <h3>Habit Insights: {habitData.title}</h3>
          
          <div className="habit-insights">
            <div className="insight-item">
              <h4>Current Streak</h4>
              <p className="insight-value">{habitData.streak} days</p>
            </div>
            
            <div className="insight-item">
              <h4>Completion Rate</h4>
              <p className="insight-value">
                {Math.round((habitData.history.filter(entry => entry.completed).length / habitData.history.length) * 100)}%
              </p>
            </div>
            
            <div className="insight-item">
              <h4>Total Completions</h4>
              <p className="insight-value">{habitData.history.filter(entry => entry.completed).length}</p>
            </div>
          </div>
          
          <div className="habit-history-chart">
            <h4>Recent Activity</h4>
            <div className="history-bars">
              {habitData.history
                .filter(entry => entry.date.startsWith(selectedMonth))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(entry => (
                  <div 
                    key={entry.date}
                    className="history-bar-container" 
                    title={`${entry.date}: ${entry.value} ${habitData.unit}`}
                  >
                    <div 
                      className={`history-bar ${entry.completed ? 'completed' : ''}`}
                      style={{ 
                        height: `${(entry.value / habitData.target) * 100}%`,
                        backgroundColor: entry.completed ? habitData.color : 'var(--glass-bg)'
                      }}
                    ></div>
                    <div className="history-date">
                      {new Date(entry.date).getDate()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics; 