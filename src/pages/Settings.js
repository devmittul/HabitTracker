import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { exportData, importData, mergeData } from '../utils/dataManagement';
import { requestNotificationPermission } from '../utils/notificationService';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { habits, isLoaded } = useHabits();
  const [settings, setSettings] = useState({
    notifications: true,
    reminderTime: '20:00',
    achievementsEnabled: true,
    exportData: false,
    autoDelete: false,
    autoDeleteDays: 30
  });
  const [importStatus, setImportStatus] = useState({
    status: null, // 'success', 'error', or null
    message: ''
  });
  const fileInputRef = useRef(null);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Request notification permission if enabled
  useEffect(() => {
    if (settings.notifications) {
      requestNotificationPermission();
    }
  }, [settings.notifications]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleReset = () => {
    // Confirm before resetting
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        notifications: true,
        reminderTime: '20:00',
        achievementsEnabled: true,
        exportData: false,
        autoDelete: false,
        autoDeleteDays: 30
      });
    }
  };
  
  const handleExportData = () => {
    if (!isLoaded || habits.length === 0) {
      setImportStatus({
        status: 'error',
        message: 'No habits data to export'
      });
      return;
    }
    
    const result = exportData(habits);
    if (result.success) {
      setImportStatus({
        status: 'success',
        message: 'Data exported successfully'
      });
    } else {
      setImportStatus({
        status: 'error',
        message: 'Failed to export data: ' + (result.error?.message || 'Unknown error')
      });
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setImportStatus({
        status: 'loading',
        message: 'Importing data...'
      });
      
      const result = await importData(file);
      
      if (result.success) {
        // Add imported habits to existing habits using localStorage
        const importedHabits = result.data;
        
        // Since we can't directly update the context from here,
        // we'll use localStorage to trigger an update
        const savedHabits = JSON.parse(localStorage.getItem('habits') || '[]');
        const mergeResult = mergeData(savedHabits, importedHabits);
        
        if (mergeResult.success) {
          localStorage.setItem('habits', JSON.stringify(mergeResult.data));
          setImportStatus({
            status: 'success',
            message: `Successfully imported ${importedHabits.length} habits. Reload the app to see changes.`
          });
        } else {
          setImportStatus({
            status: 'error',
            message: 'Error merging data: ' + (mergeResult.error?.message || 'Unknown error')
          });
        }
      } else {
        setImportStatus({
          status: 'error',
          message: result.error || 'Failed to import data'
        });
      }
    } catch (error) {
      setImportStatus({
        status: 'error',
        message: 'Error: ' + (error.message || 'Unknown error')
      });
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  return (
    <div className="settings-container animate-in">
      <h2 className="page-title">Settings</h2>
      
      <div className="glass-card settings-card">
        <h3>Appearance</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <span>Dark Mode</span>
            <p className="setting-description">Switch between light and dark theme</p>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={toggleDarkMode}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="glass-card settings-card">
        <h3>Notifications</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <span>Enable Notifications</span>
            <p className="setting-description">Get reminders for your habits</p>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                name="notifications"
                checked={settings.notifications} 
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        {settings.notifications && (
          <div className="setting-item">
            <div className="setting-label">
              <span>Reminder Time</span>
              <p className="setting-description">When to send daily reminders</p>
            </div>
            <div className="setting-control">
              <input 
                type="time" 
                name="reminderTime"
                value={settings.reminderTime} 
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="glass-card settings-card">
        <h3>Achievements & Gamification</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <span>Enable Achievements</span>
            <p className="setting-description">Earn badges for completing habits</p>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                name="achievementsEnabled"
                checked={settings.achievementsEnabled} 
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="glass-card settings-card">
        <h3>Data Management</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <span>Export Data to Cloud</span>
            <p className="setting-description">Sync your habits across devices</p>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                name="exportData"
                checked={settings.exportData} 
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="setting-item">
          <div className="setting-label">
            <span>Auto-delete Old Data</span>
            <p className="setting-description">Remove habit entries older than specified days</p>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                name="autoDelete"
                checked={settings.autoDelete} 
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        {settings.autoDelete && (
          <div className="setting-item">
            <div className="setting-label">
              <span>Days to Keep</span>
              <p className="setting-description">Number of days to keep habit data</p>
            </div>
            <div className="setting-control">
              <input 
                type="number" 
                name="autoDeleteDays"
                min="7"
                max="365"
                value={settings.autoDeleteDays} 
                onChange={handleChange}
              />
            </div>
          </div>
        )}
        
        <div className="backup-restore-section">
          <h4>Backup and Restore</h4>
          <p className="setting-description">Save your habits data or restore from a backup file</p>
          
          <div className="backup-restore-buttons">
            <button 
              className="btn btn-secondary" 
              onClick={handleExportData}
              disabled={!isLoaded || habits.length === 0}
            >
              Export Data
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={triggerFileInput}
            >
              Import Data
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImportFile}
            />
          </div>
          
          {importStatus.status && (
            <div className={`import-status ${importStatus.status}`}>
              <p>{importStatus.message}</p>
              {importStatus.status === 'success' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Reload App
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="setting-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset to Default
          </button>
          <button className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>
      
      <div className="glass-card about-card">
        <h3>About</h3>
        <p>Habit Tracker v1.0.0</p>
        <p>A beautiful habit tracking app with modern UI</p>
        <p>© 2025 Habit Tracker</p>
      </div>
    </div>
  );
};

export default Settings; 