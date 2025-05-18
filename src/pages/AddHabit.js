import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import ReminderControl from '../components/ReminderControl';

const AddHabit = () => {
  const navigate = useNavigate();
  const { addHabit } = useHabits();
  
  const [habit, setHabit] = useState({
    title: '',
    description: '',
    category: 'Health',
    icon: '💧',
    target: 1,
    unit: 'times',
    frequency: 'daily',
    weeklyDay: 1,
    monthlyDate: 1,
    color: '#6d9ee1',
    reminderEnabled: false,
    reminderTime: '20:00'
  });
  
  const icons = ['💧', '🏃‍♂️', '📚', '🧘‍♀️', '🍎', '💤', '💻', '🎵', '🏋️‍♀️', '🧹', '💊', '🚰'];
  const categories = ['Health', 'Productivity', 'Wellness', 'Fitness', 'Learning', 'Finance'];
  const colors = ['#6d9ee1', '#a991d4', '#f9c5d1', '#b0e0a8', '#f9d89c', '#f4a7a7'];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHabit(prev => ({
      ...prev,
      [name]: name === 'target' ? parseInt(value) || 1 : value
    }));
  };
  
  const handleReminderChange = (enabled, time) => {
    setHabit(prev => ({
      ...prev,
      reminderEnabled: enabled,
      reminderTime: time
    }));
  };
  
  const handlePermissionChange = (status) => {
    // If permission was denied, we might want to show a message or take some action
    if (status !== 'granted') {
      console.log('Notification permission not granted');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addHabit(habit);
    navigate('/habits');
  };
  
  return (
    <div className="add-habit-container animate-in">
      <h2 className="page-title">Add New Habit</h2>
      
      <div className="glass-card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Habit Name</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="E.g., Drink Water"
              value={habit.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="E.g., Drink 8 glasses of water daily"
              value={habit.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select 
                id="category" 
                name="category" 
                value={habit.category} 
                onChange={handleChange}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select 
                id="frequency" 
                name="frequency" 
                value={habit.frequency} 
                onChange={handleChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          {habit.frequency === 'weekly' && (
            <div className="form-group">
              <label htmlFor="weeklyDay">Day of Week</label>
              <select 
                id="weeklyDay" 
                name="weeklyDay" 
                value={habit.weeklyDay} 
                onChange={handleChange}
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={0}>Sunday</option>
              </select>
            </div>
          )}
          
          {habit.frequency === 'monthly' && (
            <div className="form-group">
              <label htmlFor="monthlyDate">Day of Month</label>
              <select 
                id="monthlyDate" 
                name="monthlyDate" 
                value={habit.monthlyDate} 
                onChange={handleChange}
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="target">Target</label>
              <input
                type="number"
                id="target"
                name="target"
                min="1"
                value={habit.target}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                type="text"
                id="unit"
                name="unit"
                placeholder="times, glasses, minutes, etc."
                value={habit.unit}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Icon</label>
            <div className="icons-grid">
              {icons.map(icon => (
                <div 
                  key={icon}
                  className={`icon-option ${habit.icon === icon ? 'selected' : ''}`}
                  onClick={() => setHabit(prev => ({ ...prev, icon }))}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Color</label>
            <div className="colors-grid">
              {colors.map(color => (
                <div 
                  key={color}
                  className={`color-option ${habit.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setHabit(prev => ({ ...prev, color }))}
                >
                  {habit.color === color && '✓'}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Reminder</label>
            <ReminderControl 
              enabled={habit.reminderEnabled}
              time={habit.reminderTime}
              onChange={handleReminderChange}
              onPermissionChange={handlePermissionChange}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/habits')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabit; 