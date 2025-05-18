/**
 * Data Management Utilities
 * Provides functionality for importing and exporting habit data
 */

// Export habits data to a JSON file
export const exportData = (habits) => {
  try {
    // Create a data object with metadata and habits
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: habits
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error };
  }
};

// Import habits data from a JSON file
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          
          // Validate the imported data
          if (!importedData.data || !Array.isArray(importedData.data)) {
            return reject({ 
              success: false, 
              error: 'Invalid file format. Expected habits data array.' 
            });
          }
          
          resolve({ 
            success: true, 
            data: importedData.data,
            metadata: {
              version: importedData.version,
              exportDate: importedData.exportDate
            }
          });
          
        } catch (parseError) {
          reject({ 
            success: false, 
            error: 'Failed to parse JSON data.' 
          });
        }
      };
      
      reader.onerror = () => {
        reject({ 
          success: false, 
          error: 'Error reading file.' 
        });
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      reject({ 
        success: false, 
        error: 'Error importing data.'
      });
    }
  });
};

// Merge imported data with existing data
export const mergeData = (existingHabits, importedHabits) => {
  try {
    // Create a map of existing habits by ID for quick lookup
    const existingHabitsMap = new Map(
      existingHabits.map(habit => [habit.id, habit])
    );
    
    // Process each imported habit
    const mergedHabits = [...existingHabits];
    
    importedHabits.forEach(importedHabit => {
      if (existingHabitsMap.has(importedHabit.id)) {
        // Habit with this ID already exists, update properties
        const index = mergedHabits.findIndex(h => h.id === importedHabit.id);
        mergedHabits[index] = {
          ...mergedHabits[index],
          ...importedHabit,
          // Merge history entries
          history: mergeHistoryEntries(
            mergedHabits[index].history || [],
            importedHabit.history || []
          )
        };
      } else {
        // New habit, add to the merged list
        mergedHabits.push(importedHabit);
      }
    });
    
    return { success: true, data: mergedHabits };
  } catch (error) {
    console.error('Error merging data:', error);
    return { success: false, error };
  }
};

// Helper function to merge history entries
const mergeHistoryEntries = (existingEntries, importedEntries) => {
  // Create a map of existing entries by date
  const entriesMap = new Map(
    existingEntries.map(entry => [entry.date, entry])
  );
  
  // Add or update with imported entries
  importedEntries.forEach(entry => {
    if (entriesMap.has(entry.date)) {
      // Use the entry with the higher value or the completed one
      const existingEntry = entriesMap.get(entry.date);
      if (entry.completed && !existingEntry.completed) {
        entriesMap.set(entry.date, entry);
      } else if (entry.value > (existingEntry.value || 0)) {
        entriesMap.set(entry.date, entry);
      }
    } else {
      entriesMap.set(entry.date, entry);
    }
  });
  
  // Convert map back to array
  return Array.from(entriesMap.values());
}; 