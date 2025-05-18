import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Import context
import { HabitProvider } from './context/HabitContext';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HabitsList = lazy(() => import('./pages/HabitsList'));
const AddHabit = lazy(() => import('./pages/AddHabit'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Settings = lazy(() => import('./pages/Settings'));

// Initial demo data
const initialHabits = [
  {
    id: 1,
    title: 'Drink Water',
    description: 'Drink 8 glasses of water',
    category: 'Health',
    icon: '💧',
    target: 8,
    unit: 'glasses',
    frequency: 'daily',
    createdAt: new Date(),
    streak: 5,
    history: generateDummyHistory(30, 0.7),
    color: '#6d9ee1'
  },
  {
    id: 2,
    title: 'Read Book',
    description: 'Read for 30 minutes',
    category: 'Productivity',
    icon: '📚',
    target: 30,
    unit: 'minutes',
    frequency: 'daily',
    createdAt: new Date(),
    streak: 3,
    history: generateDummyHistory(30, 0.5),
    color: '#a991d4'
  },
  {
    id: 3,
    title: 'Meditate',
    description: 'Meditate for 10 minutes',
    category: 'Wellness',
    icon: '🧘‍♀️',
    target: 10,
    unit: 'minutes',
    frequency: 'daily',
    createdAt: new Date(),
    streak: 10,
    history: generateDummyHistory(30, 0.8),
    color: '#f9c5d1'
  }
];

// Generate dummy history data for the demo
function generateDummyHistory(days, completionRate) {
  const history = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      completed: Math.random() < completionRate,
      value: Math.random() < completionRate ? 
        Math.floor(Math.random() * 10) + 1 : 0
    });
  }
  
  return history;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check local storage for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark mode class to body
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <ErrorBoundary showReset>
      <ThemeProvider value={{ darkMode, toggleDarkMode }}>
        <HabitProvider initialHabits={initialHabits}>
          <Router>
            <div className="app-container">
              <Header />
              <div className="main-content">
                <Sidebar />
                <div className="content-area">
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/add" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/habits" element={<HabitsList />} />
                        <Route path="/add" element={<AddHabit />} />
                        <Route path="/stats" element={<Statistics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/add" />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </Router>
        </HabitProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 