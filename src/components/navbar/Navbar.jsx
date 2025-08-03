import React, { useState, useEffect, useRef } from 'react';
import {
  FaUserCircle,
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaBars,
  FaHome,
  FaBox, // Product icon instead of FaStore
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaClipboardList,
  FaQuestionCircle,
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  // Cart and Wishlist count states - you can connect these to your state management
  const [cartCount, setCartCount] = useState(3); // Example: 3 items in cart
  const [wishlistCount, setWishlistCount] = useState(5); // Example: 5 items in wishlist

  // User data - you can connect this to your authentication state
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null, // You can add avatar URL here
  });

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    { id: 'product', icon: FaBox, label: 'Product' }, // Changed from FaStore to FaBox (product icon)
    { id: 'search', icon: searchActive ? FaTimes : FaSearch, label: 'Search' }, // Dynamic icon
    { id: 'cart', icon: FaShoppingCart, label: 'Cart', count: cartCount },
    { id: 'wishlist', icon: FaHeart, label: 'Wishlist', count: wishlistCount },
  ];

  // User dropdown menu items
  const userMenuItems = [
    { icon: FaUser, label: 'My Profile', path: '/profile' },
    { icon: FaClipboardList, label: 'My Orders', path: '/orders' },
    { icon: FaHeart, label: 'Wishlist', path: path.wishlist },
    { icon: FaCog, label: 'Settings', path: '/settings' },
    { icon: FaQuestionCircle, label: 'Help & Support', path: '/support' },
    { icon: FaSignOutAlt, label: 'Logout', action: 'logout' },
  ];

  const handleSearch = () => {
    navigate(`/search?query=${encodeURIComponent(searchText)}`);
  };

  const handleBottomNavClick = (tabId) => {
    if (tabId === 'search') {
      // Toggle search functionality
      if (searchActive) {
        // If search is active, close it
        handleSearchClose();
      } else {
        // If search is not active, open it
        setSearchActive(true);
        setActiveBottomTab(tabId);
      }
    } else {
      // For other tabs, close search and navigate
      setSearchActive(false);
      setSearchText('');
      setActiveBottomTab(tabId);
      navigate(`/${tabId}`);
    }
  };

  const handleSearchClose = () => {
    setSearchActive(false);
    setSearchText('');
    setActiveBottomTab('home'); // Reset to home tab when search is closed
  };

  const handleUserMenuClick = (item) => {
    if (item.action === 'logout') {
      // Handle logout logic here
      console.log('Logging out...');
      // You can add your logout logic here
      // Example: dispatch(logout()) or call logout API
    } else if (item.path) {
      navigate(item.path);
    }
    setShowUserDropdown(false); // Close dropdown after any menu item click
  };

  // Icon with badge component
  const IconWithBadge = ({ icon: Icon, count, className, ...props }) => (
    <div className="icon-with-badge" {...props}>
      <Icon className={className} />
      {count > 0 && <span className="badge-counter">{count > 99 ? '99+' : count}</span>}
    </div>
  );

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

                {/* User Profile Icon with Dropdown */}
                <div
                  className="user-profile-wrapper"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <FaUserCircle className="icon user-icon" />

                  {/* User Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt="User Avatar" />
                          ) : (
                            <FaUserCircle />
                          )}
                        </div>
                        <div className="user-details">
                          <h4>{user.name}</h4>
                          <p>{user.email}</p>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <ul className="user-menu-list">
                        {userMenuItems.map((item, index) => (
                          <li
                            key={index}
                            className="user-menu-item"
                            onClick={() => handleUserMenuClick(item)}
                          >
                            <item.icon className="menu-icon" />
                            <span>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Link to={path.wishlist} className="desktop-only">
                  <IconWithBadge
                    icon={FaHeart}
                    count={wishlistCount}
                    className="icon"
                  />
                </Link>
                <Link to={path.cart} className="desktop-only">
                  <IconWithBadge
                    icon={FaShoppingCart}
                    count={cartCount}
                    className="icon"
                  />
                </Link>
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
      {/*<div className="bottom-navigation">*/}
      {/*  {bottomNavItems.map((item) => {*/}
      {/*    const IconComponent = item.icon;*/}
      {/*    return (*/}
      {/*      <div*/}
      {/*        key={item.id}*/}
      {/*        className={`bottom-nav-item ${*/}
      {/*          item.id === 'search' */}
      {/*            ? (searchActive ? 'active' : '') */}
      {/*            : (activeBottomTab === item.id ? 'active' : '')*/}
      {/*        }`}*/}
      {/*        onClick={() => handleBottomNavClick(item.id)}*/}
      {/*      >*/}
      {/*        {item.count !== undefined ? (*/}
      {/*          <div className="icon-with-badge">*/}
      {/*            <IconComponent className="bottom-nav-icon" />*/}
      {/*            {item.count > 0 && (*/}
      {/*              <span className="badge-counter">{item.count > 99 ? '99+' : item.count}</span>*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        ) : (*/}
      {/*          <IconComponent className="bottom-nav-icon" />*/}
      {/*        )}*/}
      {/*        <span className="bottom-nav-label">{item.label}</span>*/}
      {/*      </div>*/}
      {/*    );*/}
      {/*  })}*/}
      {/*</div>*/}
      // Bottom Navigation section এর জন্য updated code:

{/* Bottom Navigation */}
<div className="bottom-navigation">
  {bottomNavItems.map((item) => {
    const IconComponent = item.icon;
    const isSearchClose = item.id === 'search' && searchActive;

    return (
      <div
        key={item.id}
        className={`bottom-nav-item ${
          item.id === 'search' 
            ? (searchActive ? 'active' : '') 
            : (activeBottomTab === item.id ? 'active' : '')
        }`}
        data-search-close={isSearchClose} // এই line টা add করুন
        onClick={() => handleBottomNavClick(item.id)}
      >
        {item.count !== undefined ? (
          <div className="icon-with-badge">
            <IconComponent className="bottom-nav-icon" />
            {item.count > 0 && (
              <span className="badge-counter">{item.count > 99 ? '99+' : item.count}</span>
            )}
          </div>
        ) : (
          <IconComponent className="bottom-nav-icon" />
        )}
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