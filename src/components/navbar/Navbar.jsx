import React, { useState } from 'react';
import {
  FaUserCircle,
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaBars,
  FaHome,
  FaStore,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.scss';
import logo from '../../assets/my_logo.png';
import path from '../../routes/path.jsx'; // Using your centralized path

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');

  const navigate = useNavigate();

  const menuItems = [
    { name: 'Home', path: path.home },
    {
      name: 'Product',
      path: path.product,
      dropdown: ['All Products', 'Featured', 'Best Sellers'],
    },
    { name: 'About Us', path: '/about' },
    {
      name: 'Blog',
      path: '/blog',
      dropdown: ['Latest Posts', 'Tutorials'],
    },
    {
      name: 'Categories',
      path: '/categories',
      dropdown: ['Men', 'Women', 'Kids'],
    },
    {
      name: 'Pages',
      path: '/pages',
      dropdown: ['FAQ', 'Terms', 'Privacy'],
    },
    { name: 'Contact', path: '/contact' },
  ];

  const bottomNavItems = [
    { id: 'home', icon: FaHome, label: 'Home' },
    { id: 'product', icon: FaStore, label: 'Product' }, // renamed from shop
    { id: 'search', icon: FaSearch, label: 'Search' },
    { id: 'cart', icon: FaShoppingCart, label: 'Cart' },
    { id: 'wishlist', icon: FaHeart, label: 'Wishlist' },
  ];

  const handleSearch = () => {
    navigate(`/search?query=${encodeURIComponent(searchText)}`);
  };

  const handleBottomNavClick = (tabId) => {
    setActiveBottomTab(tabId);
    if (tabId === 'search') {
      setSearchActive(true);
    } else {
      setSearchActive(false);
      setSearchText('');
      navigate(`/${tabId}`);
    }
  };

  const handleSearchClose = () => {
    setSearchActive(false);
    setSearchText('');
    setActiveBottomTab('home');
  };

  return (
    <>
      <header className="navbar-main">
        <div
          className={`navbar-container ${
            searchActive ? 'search-active' : ''
          } ${mobileSidebarOpen ? 'blurred' : ''}`}
        >
          <div className="navbar-left">
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
                    <Link to={item.path || '#'}>
                      {item.name} {item.dropdown && <FaChevronDown className="arrow" />}
                    </Link>
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
                <FaUserCircle className="icon" />
                <Link to={path.wishlist}><FaHeart className="icon desktop-only" /></Link>
                <Link to={path.cart}><FaShoppingCart className="icon desktop-only" /></Link>
              </>
            ) : (
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  autoFocus
                />
                <button className="search-btn" onClick={handleSearch}>
                  <FaSearch />
                </button>
                <button className="close-btn" onClick={handleSearchClose}>
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
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

      {/* Mobile Sidebar */}
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
                  <Link to={item.path || '#'}>{item.name}</Link>
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
