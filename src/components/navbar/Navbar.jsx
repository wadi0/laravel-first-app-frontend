import React, { useState } from 'react';
import {
  FaUser,
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaBars,
} from 'react-icons/fa';
import './navbar.scss';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Home' },
    { name: 'Shop', dropdown: ['All Products', 'Featured', 'Best Sellers'] },
    { name: 'About Us' },
    { name: 'Blog', dropdown: ['Latest Posts', 'Tutorials'] },
    { name: 'Categories', dropdown: ['Men', 'Women', 'Kids'] },
    { name: 'Pages', dropdown: ['FAQ', 'Terms', 'Privacy'] },
    { name: 'Contact' },
  ];

  const handleSearch = () => {
    console.log('Search for:', searchText);
    // এখানে তোমার search logic দিতে পারো
  };

  return (
    <>
      <header className={`navbar ${searchActive ? 'search-active' : ''} ${mobileSidebarOpen ? 'blurred' : ''}`}>
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
            <div className="search-box desktop-only">
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button className="search-btn" onClick={handleSearch}>
                <FaSearch />
              </button>
              <button
                className="close-btn"
                onClick={() => {
                  setSearchActive(false);
                  setSearchText('');
                }}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      </header>

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
