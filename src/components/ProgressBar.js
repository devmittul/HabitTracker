import React, { useEffect, useRef } from 'react';

const ProgressBar = ({ percentage, color = '#6d9ee1' }) => {
  const progressRef = useRef(null);
  
  useEffect(() => {
    const progressBar = progressRef.current;
    
    if (progressBar) {
      // Animate progress bar width
      progressBar.style.width = `${percentage}%`;
      
      // Change color based on progress
      if (percentage < 33) {
        progressBar.style.background = `linear-gradient(to right, ${color}88, ${color}aa)`;
      } else if (percentage < 66) {
        progressBar.style.background = `linear-gradient(to right, ${color}aa, ${color}cc)`;
      } else {
        progressBar.style.background = `linear-gradient(to right, ${color}cc, ${color})`;
      }
      
      // Add glowing animation when completed
      if (percentage >= 100) {
        progressBar.classList.add('completed');
      } else {
        progressBar.classList.remove('completed');
      }
    }
  }, [percentage, color]);
  
  return (
    <div className="progress-container">
      <div 
        ref={progressRef} 
        className="progress-bar"
        style={{ width: '0%' }}
      ></div>
    </div>
  );
};

export default ProgressBar; 