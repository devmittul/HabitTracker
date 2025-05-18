import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [useBottomNav, setUseBottomNav] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [atPageBottom, setAtPageBottom] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const firstNavLinkRef = useRef(null);
  
  // Check if user has reached the bottom of the page
  const checkIfPageBottom = useCallback(() => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    
    // If we're within 50px of the bottom, consider it "at bottom"
    setAtPageBottom(pageHeight - scrollPosition < 50);
  }, []);
  
  // Handle scroll events to hide/show navigation bar
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Check if we're at the bottom of the page
    checkIfPageBottom();
    
    if (currentScrollY <= 10) {
      // Always show nav when at the top
      setVisible(true);
    } else if (atPageBottom) {
      // Always show nav when at the bottom
      setVisible(true);
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up - show nav
      setVisible(true);
    } else if (currentScrollY > lastScrollY) {
      // Scrolling down - hide nav
      setVisible(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY, atPageBottom, checkIfPageBottom]);
  
  // Focus first nav link when menu opens
  useEffect(() => {
    if (mobileMenuOpen && firstNavLinkRef.current) {
      // Small delay to allow animation to start
      setTimeout(() => {
        firstNavLinkRef.current.focus();
      }, 100);
    }
  }, [mobileMenuOpen]);
  
  // Check if mobile menu is open
  useEffect(() => {
    const checkMobileMenuOpen = () => {
      const isMenuOpen = document.body.classList.contains('mobile-menu-open');
      setMobileMenuOpen(isMenuOpen);
    };
    
    // Initial check
    checkMobileMenuOpen();
    
    // Create a mutation observer to watch for class changes on body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          mutation.target === document.body
        ) {
          checkMobileMenuOpen();
        }
      });
    });
    
    // Start observing the body element
    observer.observe(document.body, { attributes: true });
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Check screen size and set bottom navigation for small screens
  useEffect(() => {
    const checkScreenSize = () => {
      // Removed bottom navigation for mobile
      setUseBottomNav(false);
      document.body.classList.remove('use-bottom-nav');
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      document.body.classList.remove('use-bottom-nav');
    };
  }, []);
  
  // Add scroll event listener
  useEffect(() => {
    if (useBottomNav) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Update body class based on whether we're at the page bottom
      if (atPageBottom) {
        document.body.classList.add('at-page-bottom');
      } else {
        document.body.classList.remove('at-page-bottom');
      }
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.body.classList.remove('at-page-bottom');
      };
    }
  }, [useBottomNav, handleScroll, atPageBottom]);
  
  // Close mobile menu when a nav link is clicked
  const handleNavLinkClick = () => {
    if (mobileMenuOpen) {
      document.body.classList.remove('mobile-menu-open');
    }
  };
  
  // Navigation sections with enhanced styling
  const navSections = [
    {
      title: "Main",
      icon: "🏠",
      items: [
        { path: '/dashboard', icon: '📊', activeIcon: '📊', text: 'Dashboard' },
        { path: '/habits', icon: '📝', activeIcon: '📔', text: 'My Habits' },
      ]
    },
    {
      title: "Create",
      icon: "✨",
      items: [
        { path: '/add', icon: '➕', activeIcon: '✨', text: 'Add Habit' },
      ]
    },
    {
      title: "Insights",
      icon: "📈",
      items: [
        { path: '/stats', icon: '📈', activeIcon: '📈', text: 'Stats' },
        { path: '/settings', icon: '⚙️', activeIcon: '⚙️', text: 'Settings' },
      ]
    }
  ];
  
  const sidebarClass = `sidebar ${useBottomNav ? 'bottom-nav' : 'glass-card'} 
    ${!visible && useBottomNav && !mobileMenuOpen ? 'hidden' : ''} 
    ${mobileMenuOpen ? 'mobile-open' : ''}`;
  
  return (
    <aside 
      className={sidebarClass} 
      ref={sidebarRef}
      id="mobile-menu"
      aria-hidden={!mobileMenuOpen}
      tabIndex={mobileMenuOpen ? 0 : -1}
    >
      <nav className="navigation">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="nav-section">
            <h3 className="nav-section-title" id={`nav-section-${sectionIndex}`}>
              <span className="section-icon">{section.icon}</span> {section.title}
            </h3>
            <ul 
              className="sidebar-nav" 
              aria-labelledby={`nav-section-${sectionIndex}`}
              role="menu"
            >
              {section.items.map((item, itemIndex) => {
                // Create a ref for the first nav link across all sections
                const isFirstLink = sectionIndex === 0 && itemIndex === 0;
                
                return (
                  <li key={item.path} className="nav-item" role="none">
                    <NavLink 
                      to={item.path} 
                      className={({ isActive }) => 
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                      onClick={handleNavLinkClick}
                      ref={isFirstLink ? firstNavLinkRef : null}
                      role="menuitem"
                    >
                      {({ isActive }) => (
                        <div className="nav-content">
                          <span className="nav-icon">
                            {isActive ? item.activeIcon : item.icon}
                          </span>
                          <span className="nav-text">{item.text}</span>
                        </div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      {!useBottomNav && (
        <div className="sidebar-footer">
          <div className="quote-of-day">
            <p>Build habits that build you.</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 