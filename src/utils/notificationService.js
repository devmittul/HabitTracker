/**
 * Notification Service for Habit Tracker
 * Provides functionality to request permission, schedule, and send notifications
 */

// Check if browser supports notifications
const areNotificationsSupported = () => {
  return 'Notification' in window;
};

// Request notification permission
const requestNotificationPermission = async () => {
  if (!areNotificationsSupported()) {
    return { status: 'unsupported' };
  }
  
  try {
    const permission = await Notification.requestPermission();
    return { status: permission };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { status: 'error', error };
  }
};

// Send a notification
const sendNotification = (title, options = {}) => {
  if (!areNotificationsSupported()) {
    return false;
  }
  
  if (Notification.permission !== 'granted') {
    return false;
  }
  
  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });
    
    // Add click handler if provided
    if (options.onClick) {
      notification.onclick = options.onClick;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Schedule a notification for a specific time
const scheduleNotification = (title, options = {}, scheduledTime) => {
  if (!areNotificationsSupported()) {
    return null;
  }
  
  const now = new Date().getTime();
  const timeToNotification = scheduledTime.getTime() - now;
  
  // Don't schedule if time is in the past
  if (timeToNotification <= 0) {
    return null;
  }
  
  // Schedule notification
  const timerId = setTimeout(() => {
    sendNotification(title, options);
  }, timeToNotification);
  
  return timerId;
};

// Cancel a scheduled notification
const cancelScheduledNotification = (timerId) => {
  if (timerId) {
    clearTimeout(timerId);
    return true;
  }
  return false;
};

// Creates a daily reminder for habits
const createDailyReminder = (habitTitle, time = '20:00') => {
  if (!areNotificationsSupported() || Notification.permission !== 'granted') {
    return null;
  }
  
  // Parse scheduled time
  const [hours, minutes] = time.split(':').map(Number);
  
  // Calculate the next occurrence of the specified time
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
  
  // If the time has already passed today, schedule for tomorrow
  if (scheduledTime.getTime() <= now.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  // Schedule the notification
  return scheduleNotification(
    `Don't forget: ${habitTitle}`, 
    {
      body: 'Time to complete your habit!',
      tag: `habit-reminder-${habitTitle}`,
      requireInteraction: true
    },
    scheduledTime
  );
};

export {
  areNotificationsSupported,
  requestNotificationPermission,
  sendNotification,
  scheduleNotification,
  cancelScheduledNotification,
  createDailyReminder
}; 