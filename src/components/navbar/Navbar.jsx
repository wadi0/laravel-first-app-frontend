import React, { useState } from 'react';
import {
  FaUser,
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaBars,
  FaHome,
  FaStore,
} from 'react-icons/fa';
import './navbar.scss';
import logo from '../../assets/my_logo.png';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');

  const menuItems = [
    { name: 'Home' },
    { name: 'Shop', dropdown: ['All Products', 'Featured', 'Best Sellers'] },
    { name: 'About Us' },
    { name: 'Blog', dropdown: ['Latest Posts', 'Tutorials'] },
    { name: 'Categories', dropdown: ['Men', 'Women', 'Kids'] },
    { name: 'Pages', dropdown: ['FAQ', 'Terms', 'Privacy'] },
    { name: 'Contact' },
  ];

  const bottomNavItems = [
    { id: 'home', icon: FaHome, label: 'Home' },
    { id: 'shop', icon: FaStore, label: 'Shop' },
    { id: 'search', icon: FaSearch, label: 'Search' },
    { id: 'cart', icon: FaShoppingCart, label: 'Cart' },
    { id: 'wishlist', icon: FaHeart, label: 'Wishlist' },
  ];

  const handleSearch = () => {
    console.log('Search for:', searchText);
    // এখানে তোমার search logic দিতে পারো
  };

  const handleBottomNavClick = (tabId) => {
    setActiveBottomTab(tabId);
    if (tabId === 'search') {
      setSearchActive(true);
    }
    // এখানে navigation logic add করতে পারো
    console.log('Bottom nav clicked:', tabId);
  };

  const handleSearchClose = () => {
    setSearchActive(false);
    setSearchText('');
    setActiveBottomTab('home'); // Reset to home when closing search
  };

  return (
    <>
      <header  className="navbar-main">
        <div className={`navbar-container ${searchActive ? 'search-active' : ''} ${mobileSidebarOpen ? 'blurred' : ''}`}>
        <div className="navbar-left">
          {/* Mobile toggle icon */}
          <div className="mobile-toggle" onClick={() => setMobileSidebarOpen(true)}>
            <FaBars />
          </div>

          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        {!searchActive && (
          <nav className="navbar-center">
            <ul className="menu">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`menu-item ${activeDropdown === index ? 'active' : ''}`}
                  onMouseEnter={() => setActiveDropdown(index)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <span>
                    {item.name} {item.dropdown && <FaChevronDown className="arrow" />}
                  </span>
                  {item.dropdown && activeDropdown === index && (
                    <ul className="dropdown">
                      {item.dropdown.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <a href="#">{subItem}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="navbar-right">
          {!searchActive ? (
            <>
              <FaSearch className="icon desktop-only" onClick={() => setSearchActive(true)} />
              <FaUser className="icon" />
              <FaHeart className="icon desktop-only" />
              <FaShoppingCart className="icon desktop-only" />
            </>
          ) : (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                autoFocus
              />
              <button className="search-btn" onClick={handleSearch}>
                <FaSearch />
              </button>
              <button
                className="close-btn"
                onClick={handleSearchClose}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <div className="bottom-navigation">
        {bottomNavItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className={`bottom-nav-item ${activeBottomTab === item.id ? 'active' : ''}`}
              onClick={() => handleBottomNavClick(item.id)}
            >
              <IconComponent className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <div className="logo">
                <img src={logo} alt="Logo" />
              </div>
              <FaTimes className="close-btn" onClick={() => setMobileSidebarOpen(false)} />
            </div>
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.name}
                  {item.dropdown && (
                    <ul className="dropdown">
                      {item.dropdown.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <a href="#">{subItem}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;