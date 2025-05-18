import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import HabitCard from '../components/HabitCard';

const HabitsList = () => {
  const { habits } = useHabits();
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique categories from habits
  const categories = ['all', ...new Set(habits.map(habit => habit.category))];
  
  // Filter habits based on category and search term
  const filteredHabits = habits.filter(habit => {
    const matchesCategory = filterCategory === 'all' || habit.category === filterCategory;
    const matchesSearch = habit.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          habit.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="habits-list-container animate-in">
      <h2 className="page-title">My Habits</h2>
      
      <div className="glass-card filters-card">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filterCategory === category ? 'active' : ''}`}
              onClick={() => setFilterCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {filteredHabits.length > 0 ? (
        <div className="habits-grid">
          {filteredHabits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <p>No habits found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HabitsList; 