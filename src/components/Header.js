import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuBtnRef = useRef(null);
  
  // Check if we're in mobile view
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
      
      // Close menu when resizing to desktop
      if (!isMobile && isMobileMenuOpen) {
        closeMenu();
      }
    };
    
    // Initial check
    checkMobileView();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobileView);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, [isMobileMenuOpen]);
  
  // Handle scroll detection for header effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
        document.body.classList.add('scrolled');
      } else {
        setIsScrolled(false);
        document.body.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside both the menu button and the sidebar
      if (
        isMobileMenuOpen && 
        menuBtnRef.current && 
        !menuBtnRef.current.contains(event.target) &&
        !event.target.closest('.sidebar')
      ) {
        closeMenu();
      }
    };
    
    // Handle escape key to close menu
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMenu();
      }
    };
    
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMobileMenuOpen]);
  
  // Make sure body class is synced with menu state
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  }, [isMobileMenuOpen]);
  
  // Close menu function
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  // Toggle mobile menu with improved handling
  const toggleMobileMenu = (e) => {
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event propagation
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className={`glass-card header ${isMobileView ? 'mobile-header' : ''} ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-backdrop"></div>
      <div className="mobile-header-content">
        <div className="header-left">
          {isMobileView && (
            <button 
              ref={menuBtnRef}
              className={`redesigned-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              <div className="menu-icon">
                <span className="line line-1"></span>
                <span className="line line-2"></span>
                <span className="line line-3"></span>
              </div>
            </button>
          )}
        </div>
        
        <div className={`logo ${isMobileView ? 'mobile-logo' : ''}`}>
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <span className="logo-icon">✨</span>
            </div>
            <div className="logo-text-container">
              <h1 className="logo-title">
                <span className="logo-text">Habit Tracker</span>
              </h1>
              {!isMobileView && (
                <p className="logo-tagline">Track your habits, improve your life</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className={`btn btn-secondary theme-toggle ${isMobileView ? 'mobile-theme-toggle' : ''}`} 
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            <div className="toggle-icon-container">
              <span className="theme-icon visible">{darkMode ? '🌞' : '🌙'}</span>
              <span className="theme-icon hidden">{darkMode ? '🌙' : '🌞'}</span>
            </div>
            {!isMobileView && (
              <span className="btn-text">{darkMode ? 'Light' : 'Dark'}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 