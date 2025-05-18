import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, areNotificationsSupported } from '../utils/notificationService';

const ReminderControl = ({ 
  enabled = false, 
  time = '20:00', 
  onChange,
  onPermissionChange
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [reminderTime, setReminderTime] = useState(time);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  
  // Check if notifications are supported on component mount
  useEffect(() => {
    const supported = areNotificationsSupported();
    setNotificationsSupported(supported);
    
    if (supported && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);
  
  // Handle toggle change
  const handleToggleChange = async (e) => {
    const newEnabled = e.target.checked;
    setIsEnabled(newEnabled);
    
    // If enabling reminders, check permission
    if (newEnabled && permissionStatus !== 'granted') {
      const { status } = await requestNotificationPermission();
      setPermissionStatus(status);
      
      // Notify parent component about permission change
      if (onPermissionChange) {
        onPermissionChange(status);
      }
      
      // If permission was denied, disable the toggle
      if (status !== 'granted') {
        setIsEnabled(false);
        return;
      }
    }
    
    // Notify parent component of change
    if (onChange) {
      onChange(newEnabled, reminderTime);
    }
  };
  
  // Handle time change
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setReminderTime(newTime);
    
    // Only notify parent if reminders are enabled
    if (isEnabled && onChange) {
      onChange(isEnabled, newTime);
    }
  };
  
  if (!notificationsSupported) {
    return (
      <div className="reminder-control">
        <p className="unsupported-message">
          Reminders are not supported in your browser.
        </p>
      </div>
    );
  }
  
  return (
    <div className="reminder-control">
      <div className="reminder-toggle-container">
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={isEnabled} 
            onChange={handleToggleChange} 
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="reminder-label">Daily Reminder</span>
        
        {permissionStatus === 'denied' && (
          <div className="permission-denied-message">
            Notification permission was denied. Please enable notifications in your browser settings.
          </div>
        )}
      </div>
      
      {isEnabled && permissionStatus === 'granted' && (
        <div className="time-picker-container">
          <label htmlFor="reminderTime">Reminder Time:</label>
          <input 
            type="time" 
            id="reminderTime"
            value={reminderTime}
            onChange={handleTimeChange}
            className="time-input"
          />
        </div>
      )}
    </div>
  );
};

export default ReminderControl; 