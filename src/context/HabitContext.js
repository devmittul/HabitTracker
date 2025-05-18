import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { createDailyReminder, cancelScheduledNotification } from '../utils/notificationService';

const HabitContext = createContext();

// Action types
const ADD_HABIT = 'ADD_HABIT';
const UPDATE_HABIT = 'UPDATE_HABIT';
const DELETE_HABIT = 'DELETE_HABIT';
const TOGGLE_HABIT = 'TOGGLE_HABIT';
const SET_PROGRESS = 'SET_PROGRESS';
const SET_REMINDER = 'SET_REMINDER';
const INITIALIZE = 'INITIALIZE';

// Reducer
const habitReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      return {
        ...state,
        habits: action.payload,
        isLoaded: true
      };
    case ADD_HABIT:
      return {
        ...state,
        habits: [...state.habits, action.payload]
      };
    case UPDATE_HABIT:
      return {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === action.payload.id ? { ...habit, ...action.payload } : habit
        )
      };
    case DELETE_HABIT:
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload)
      };
    case TOGGLE_HABIT: {
      const { habitId, date, completed, value } = action.payload;
      return {
        ...state,
        habits: state.habits.map(habit => {
          if (habit.id === habitId) {
            // Find existing history entry for this date
            const existingEntryIndex = habit.history.findIndex(entry => entry.date === date);
            let newHistory = [...habit.history];
            
            // Update or add history entry
            if (existingEntryIndex >= 0) {
              newHistory[existingEntryIndex] = { 
                ...newHistory[existingEntryIndex], 
                completed, 
                value 
              };
            } else {
              newHistory.push({ date, completed, value });
            }
            
            // Calculate streak
            let streak = 0;
            const sortedHistory = [...newHistory]
              .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            for (const entry of sortedHistory) {
              if (entry.completed) {
                streak++;
              } else {
                break;
              }
            }
            
            return { ...habit, history: newHistory, streak };
          }
          return habit;
        })
      };
    }
    case SET_PROGRESS: {
      const { habitId, value } = action.payload;
      return {
        ...state,
        habits: state.habits.map(habit => {
          if (habit.id === habitId) {
            return { ...habit, currentProgress: value };
          }
          return habit;
        })
      };
    }
    case SET_REMINDER: {
      const { habitId, reminderEnabled, reminderTime, reminderId } = action.payload;
      return {
        ...state,
        habits: state.habits.map(habit => {
          if (habit.id === habitId) {
            return { 
              ...habit, 
              reminderEnabled, 
              reminderTime, 
              reminderId 
            };
          }
          return habit;
        })
      };
    }
    default:
      return state;
  }
};

export const HabitProvider = ({ children, initialHabits = [] }) => {
  const [state, dispatch] = useReducer(habitReducer, {
    habits: [],
    isLoaded: false
  });
  
  // Initialize habits from localStorage or use initialHabits
  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const parsedHabits = JSON.parse(savedHabits);
        if (Array.isArray(parsedHabits) && parsedHabits.length > 0) {
          dispatch({ type: INITIALIZE, payload: parsedHabits });
        } else {
          dispatch({ type: INITIALIZE, payload: initialHabits });
        }
      } else {
        dispatch({ type: INITIALIZE, payload: initialHabits });
      }
    } catch (error) {
      console.error("Error loading habits from localStorage:", error);
      dispatch({ type: INITIALIZE, payload: initialHabits });
    }
  }, [initialHabits]);
  
  // Save to local storage whenever state.habits changes
  useEffect(() => {
    if (state.isLoaded) {
      try {
        localStorage.setItem('habits', JSON.stringify(state.habits));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [state.habits, state.isLoaded]);
  
  // Set up reminder timers when habits load or change
  useEffect(() => {
    if (!state.isLoaded) return;
    
    state.habits.forEach(habit => {
      // Clear any existing timers
      if (habit.reminderId) {
        cancelScheduledNotification(habit.reminderId);
      }
      
      // Set up new timer if reminder is enabled
      if (habit.reminderEnabled && habit.reminderTime) {
        const reminderId = createDailyReminder(habit.title, habit.reminderTime);
        if (reminderId) {
          dispatch({
            type: SET_REMINDER,
            payload: {
              habitId: habit.id,
              reminderEnabled: habit.reminderEnabled,
              reminderTime: habit.reminderTime,
              reminderId
            }
          });
        }
      }
    });
    
    // Clean up on unmount
    return () => {
      state.habits.forEach(habit => {
        if (habit.reminderId) {
          cancelScheduledNotification(habit.reminderId);
        }
      });
    };
  }, [state.isLoaded, state.habits]);
  
  // Memoize action creators to prevent unnecessary re-renders
  const addHabit = useCallback((habit) => {
    const newHabit = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      streak: 0,
      history: [],
      reminderEnabled: false,
      reminderTime: '20:00',
      ...habit
    };
    dispatch({ type: ADD_HABIT, payload: newHabit });
  }, []);
  
  const updateHabit = useCallback((habit) => {
    dispatch({ type: UPDATE_HABIT, payload: habit });
  }, []);
  
  const deleteHabit = useCallback((habitId) => {
    // Find habit to get reminder ID before deleting
    const habitToDelete = state.habits.find(h => h.id === habitId);
    if (habitToDelete?.reminderId) {
      cancelScheduledNotification(habitToDelete.reminderId);
    }
    dispatch({ type: DELETE_HABIT, payload: habitId });
  }, [state.habits]);
  
  const toggleHabit = useCallback((habitId, date, completed, value) => {
    dispatch({ 
      type: TOGGLE_HABIT, 
      payload: { habitId, date, completed, value }
    });
  }, []);
  
  const setProgress = useCallback((habitId, value) => {
    dispatch({ type: SET_PROGRESS, payload: { habitId, value } });
  }, []);
  
  const setReminder = useCallback((habitId, enabled, time) => {
    // Find existing reminder to cancel if needed
    const habit = state.habits.find(h => h.id === habitId);
    if (habit?.reminderId) {
      cancelScheduledNotification(habit.reminderId);
    }
    
    let reminderId = null;
    if (enabled && time) {
      const habitTitle = habit?.title || 'Habit';
      reminderId = createDailyReminder(habitTitle, time);
    }
    
    dispatch({ 
      type: SET_REMINDER, 
      payload: { 
        habitId, 
        reminderEnabled: enabled, 
        reminderTime: time, 
        reminderId 
      } 
    });
  }, [state.habits]);
  
  return (
    <HabitContext.Provider value={{
      habits: state.habits,
      isLoaded: state.isLoaded,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabit,
      setProgress,
      setReminder
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}; 