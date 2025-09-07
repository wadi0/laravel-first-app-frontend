import React, {useState, useEffect, useRef} from 'react';
import {
    FaUserCircle, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaChevronDown,
    FaBars, FaHome, FaBox, FaUser, FaCog, FaSignOutAlt, FaClipboardList, FaQuestionCircle,
} from 'react-icons/fa';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import './navbar.scss';
import logo from '../../assets/my_logo.png';
import path from '../../routes/path.jsx';
import {useApp} from "../context/AppContext.jsx";
import ApiUrlServices from "../network/ApiUrlServices.jsx";
import AxiosServices from "../network/AxiosServices.jsx";
import {toast} from "react-toastify";
import {IoIosLogIn} from "react-icons/io";

const Navbar = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchActive, setSearchActive] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeBottomTab, setActiveBottomTab] = useState('home');
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const userDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const mobileUserDropdownRef = useRef(null);

    // ✅ FIXED: Updated to use new context values
    const {
        cartCount, 
        wishlistCount, 
        isAuthenticated,  // Use isAuthenticated instead of isLoggedIn
        updateAuthState,  // For updating auth state
        getCartItems,     // For refreshing cart
        getWishlistItems  // For refreshing wishlist
    } = useApp();
    
    const navigate = useNavigate();
    const location = useLocation();

    // Menu configuration
    const menuItems = [
        {name: 'Home', path: path.home},
        {
            name: 'Product', path: path.product,
            dropdown: [
                {label: 'All Products', path: path.product},
                {label: 'Featured', path: '/products/featured'},
                {label: 'Best Sellers', path: '/products/bestsellers'},
            ],
        },
        {name: 'About Us', path: '/about'},
        {
            name: 'Blog', path: '/blog',
            dropdown: [
                {label: 'Latest Posts', path: '/blog/latest'},
                {label: 'Tutorials', path: '/blog/tutorials'},
            ],
        },
        {
            name: 'Pages', path: '/pages',
            dropdown: [
                {label: 'FAQ', path: '/faq'},
                {label: 'Terms', path: '/terms'},
                {label: 'Privacy', path: '/privacy'},
            ],
        },
        {name: 'Contact', path: '/contact'},
    ];

    const bottomNavItems = [
        {id: 'home', icon: FaHome, label: 'Home', path: path.home},
        {id: 'product', icon: FaBox, label: 'Product', path: path.product},
        {id: 'search', icon: searchActive ? FaTimes : FaSearch, label: 'Search'},
        {id: 'cart', icon: FaShoppingCart, label: 'Cart', count: cartCount, path: path.cart},
        {id: 'wishlist', icon: FaHeart, label: 'Wishlist', count: wishlistCount, path: path.wishlist},
    ];

    const userMenuItems = [
        {icon: FaUser, label: 'My Profile', path: '#'},
        {icon: FaClipboardList, label: 'My Orders', path: path.orders},
        {icon: FaHeart, label: 'Wishlist', path: path.wishlist},
        {icon: FaCog, label: 'Settings', path: '#'},
        {icon: FaQuestionCircle, label: 'Help & Support', path: '#'},
        {icon: FaSignOutAlt, label: 'Logout', action: 'logout'},
    ];

    // Check if current path matches menu item
    const isActiveMenu = (menuPath, dropdownItems = null) => {
        if (menuPath === location.pathname) return true;

        // Check dropdown items
        if (dropdownItems) {
            return dropdownItems.some(item => item.path === location.pathname);
        }

        return false;
    };

    // Check if current path matches submenu item
    const isActiveSubmenu = (submenuPath) => {
        return submenuPath === location.pathname;
    };

    // Update bottom tab based on current route
    const updateBottomTabFromRoute = () => {
        const currentPath = location.pathname;

        // Find matching bottom nav item
        const matchingTab = bottomNavItems.find(item => {
            if (item.path) {
                return currentPath === item.path;
            }
            return false;
        });

        if (matchingTab) {
            setActiveBottomTab(matchingTab.id);
        } else {
            // Check if current path matches any menu item to set appropriate bottom tab
            const matchingMenu = menuItems.find(menu =>
                menu.path === currentPath ||
                (menu.dropdown && menu.dropdown.some(sub => sub.path === currentPath))
            );

            if (matchingMenu) {
                if (matchingMenu.name === 'Home') {
                    setActiveBottomTab('home');
                } else if (matchingMenu.name === 'Product' ||
                          (matchingMenu.dropdown && matchingMenu.dropdown.some(sub => sub.path === currentPath))) {
                    setActiveBottomTab('product');
                } else {
                    setActiveBottomTab('home'); // Default fallback
                }
            }
        }
    };

    // ✅ FIXED: Load user data with auth state dependency
    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData?.token) {
                setUser({
                    name: userData.name || userData.username || 'User',
                    email: userData.email,
                    avatar: userData.avatar || null,
                });
                
                // ✅ Refresh cart and wishlist data when user loads
                setTimeout(() => {
                    getCartItems();
                    getWishlistItems();
                }, 100);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }, [isAuthenticated]); // ✅ Add isAuthenticated as dependency

    // Update bottom tab when route changes
    useEffect(() => {
        updateBottomTabFromRoute();
    }, [location.pathname]);

    // Separate click outside handling for desktop and mobile user dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle desktop user dropdown
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }

            // Handle mobile user dropdown separately
            if (mobileUserDropdownRef.current && !mobileUserDropdownRef.current.contains(event.target)) {
                setMobileUserDropdownOpen(false);
            }

            // Handle mobile menu
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
                setMobileUserDropdownOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = () => {
        if (searchText.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchText)}`);
            setSearchActive(false);
            setSearchText('');
            setActiveBottomTab('home');
        }
    };

    const handleBottomNav = (tabId) => {
        if (tabId === 'search') {
            if (searchActive) {
                setSearchActive(false);
                setSearchText('');
            } else {
                setSearchActive(true);
            }
            return;
        }

        setSearchActive(false);
        setSearchText('');
        setActiveBottomTab(tabId);

        const routes = {
            home: path.home,
            product: path.product,
            cart: path.cart,
            wishlist: path.wishlist
        };
        navigate(routes[tabId] || `/${tabId}`);
    };

    const handleNavigation = (navigatePath) => {
        if (navigatePath && navigatePath !== '#') {
            navigate(navigatePath);
            setMobileMenuOpen(false);
            setActiveDropdown(null);
            setSearchActive(false);
        }
    };

    // ✅ FIXED: Updated logout to immediately clear UI
    const handleLogout = async () => {
        try {
            // ✅ IMMEDIATE: Clear UI state first for instant feedback
            setUserDropdownOpen(false);
            setMobileUserDropdownOpen(false);
            setUser(null);
            
            // ✅ Update context state (this will clear cart/wishlist immediately)
            updateAuthState(null);
            
            // Then make API call
            await AxiosServices.post(ApiUrlServices.LOG_OUT);
            
            navigate(path.login);
            toast.success("Logout successful!");
        } catch (error) {
            // ✅ Even on error, ensure context is cleared
            updateAuthState(null);
            
            setUserDropdownOpen(false);
            setMobileUserDropdownOpen(false);
            setUser(null);
            navigate(path.login);
            toast.info(error.response?.status === 401 ? "Session expired." : "Logout successfully.");
        }
    };

    const handleUserMenu = (item) => {
        if (item.action === 'logout') {
            handleLogout();
        } else if (item.path && item.path !== '#') {
            navigate(item.path);
        }
        setUserDropdownOpen(false);
        setMobileUserDropdownOpen(false);
    };

    // ✅ FIXED: Updated handlers to use isAuthenticated
    const handleDesktopUserButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // If not logged in, navigate directly to login page
        if (!isAuthenticated) {  // ✅ Use isAuthenticated instead of isLoggedIn()
            navigate(path.login);
            return;
        }
        
        // If logged in, toggle dropdown
        setUserDropdownOpen(prev => !prev);
        setMobileUserDropdownOpen(false);
    };

    const handleMobileUserButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // If not logged in, navigate directly to login page
        if (!isAuthenticated) {  // ✅ Use isAuthenticated instead of isLoggedIn()
            navigate(path.login);
            return;
        }
        
        // If logged in, toggle dropdown
        setMobileUserDropdownOpen(prev => !prev);
        setUserDropdownOpen(false);
    };

    const IconWithBadge = ({icon: Icon, count, className, ...props}) => (
        <div className="icon-badge-wrapper" {...props}>
            <Icon className={className}/>
            {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
        </div>
    );

    return (
        <>
            {/* Modern Navbar */}
            <nav className="modern-navbar">
                <div className={`navbar-container ${searchActive ? 'search-mode' : ''}`}>
                    {/* Left Section - Logo */}
                    <div className="navbar-left">
                        <Link to="/" className="navbar-brand">
                            <img src={logo} alt="Logo"/>
                        </Link>
                    </div>

                    {/* Center Menu - Desktop */}
                    {!searchActive && (
                        <div className="navbar-center">
                            <ul className="navbar-menu">
                                {menuItems.map((item, index) => (
                                    <li key={index} className={`navbar-item ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveDropdown(index)}
                                        onMouseLeave={() => setActiveDropdown(null)}>
                                        <Link to={item.path || '#'} className={`navbar-link ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}>
                                            {item.name}
                                            {item.dropdown && <FaChevronDown className="dropdown-arrow"/>}
                                        </Link>
                                        {item.dropdown && activeDropdown === index && (
                                            <div className="navbar-dropdown">
                                                {item.dropdown.map((subItem, subIndex) => (
                                                    <Link key={subIndex} to={subItem.path}
                                                          className={`dropdown-item ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
                                                          onClick={(e) => {
                                                              e.preventDefault();
                                                              handleNavigation(subItem.path);
                                                          }}>
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Mobile Right Section - Hamburger and User Menu */}
                    {!searchActive && (
                        <div className="mobile-right-section">
                            <div className="mobile-menu-wrapper" ref={mobileMenuRef}>
                                <button
                                    className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    <FaBars/>
                                </button>

                                {/* Mobile Menu Dropdown */}
                                {mobileMenuOpen && (
                                    <div className="mobile-menu-dropdown">
                                        <div className="mobile-menu-content">
                                            {menuItems.map((item, index) => (
                                                <div key={index} className="mobile-menu-item">
                                                    <button
                                                        className={`mobile-menu-link ${activeDropdown === index ? 'dropdown-active' : ''} ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (item.dropdown) {
                                                                setActiveDropdown(activeDropdown === index ? null : index);
                                                            } else {
                                                                handleNavigation(item.path);
                                                            }
                                                        }}
                                                    >
                                                        <span>{item.name}</span>
                                                        {item.dropdown && (
                                                            <FaChevronDown
                                                                className={`dropdown-arrow ${activeDropdown === index ? 'rotated' : ''}`}
                                                            />
                                                        )}
                                                    </button>

                                                    {item.dropdown && activeDropdown === index && (
                                                        <div className="mobile-submenu">
                                                            {item.dropdown.map((subItem, subIndex) => (
                                                                <button
                                                                    key={subIndex}
                                                                    className={`mobile-submenu-link ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
                                                                    onClick={() => handleNavigation(subItem.path)}
                                                                >
                                                                    {subItem.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* ✅ Login section for mobile menu - Updated to use isAuthenticated */}
                                            {!isAuthenticated && (
                                                <div className="mobile-menu-login">
                                                    <button
                                                        className="mobile-login-btn"
                                                        onClick={() => {
                                                            navigate(path.login);
                                                            setMobileMenuOpen(false);
                                                        }}
                                                    >
                                                        <IoIosLogIn/>
                                                        <span>Login</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile User Menu */}
                            <div className="mobile-user-menu" ref={mobileUserDropdownRef}>
                                <div className="user-menu">
                                    <button
                                        className={`action-btn user-btn ${mobileUserDropdownOpen ? 'active' : ''}`}
                                        onClick={handleMobileUserButtonClick}
                                    >
                                        {isAuthenticated ? <FaUserCircle/> : <IoIosLogIn/>}
                                    </button>

                                    {/* ✅ Only show dropdown for logged in users - Updated to use isAuthenticated */}
                                    {mobileUserDropdownOpen && isAuthenticated && user && (
                                        <div className="user-dropdown">
                                            <div className="user-header">
                                                <div className="user-avatar">
                                                    {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
                                                        <FaUserCircle/>}
                                                </div>
                                                <div className="user-details">
                                                    <div className="user-name">{user.name}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="user-menu-list">
                                                {userMenuItems.map((item, index) => (
                                                    <button key={index}
                                                            className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
                                                            onClick={() => handleUserMenu(item)}>
                                                        <item.icon/>
                                                        <span>{item.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Actions - Desktop Icons and Search */}
                    <div className={`navbar-right ${searchActive ? 'search-active' : ''}`}>
                        {!searchActive ? (
                            <>
                                <button className="action-btn desktop-only" onClick={() => setSearchActive(true)}>
                                    <FaSearch/>
                                </button>

                                <Link to={path.wishlist} className="action-btn desktop-only">
                                    <IconWithBadge icon={FaHeart} count={wishlistCount}/>
                                </Link>

                                <Link to={path.cart} className="action-btn desktop-only">
                                    <IconWithBadge icon={FaShoppingCart} count={cartCount}/>
                                </Link>

                                {/* Desktop User Menu */}
                                <div className="user-menu" ref={userDropdownRef}>
                                    <button
                                        className={`action-btn user-btn ${userDropdownOpen ? 'active' : ''}`}
                                        onClick={handleDesktopUserButtonClick}
                                    >
                                        {isAuthenticated ? <FaUserCircle/> : <IoIosLogIn/>}
                                    </button>

                                    {/* ✅ Only show dropdown for logged in users - Updated to use isAuthenticated */}
                                    {userDropdownOpen && isAuthenticated && user && (
                                        <div className="user-dropdown">
                                            <div className="user-header">
                                                <div className="user-avatar">
                                                    {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
                                                        <FaUserCircle/>}
                                                </div>
                                                <div className="user-details">
                                                    <div className="user-name">{user.name}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="user-menu-list">
                                                {userMenuItems.map((item, index) => (
                                                    <button key={index}
                                                            className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
                                                            onClick={() => handleUserMenu(item)}>
                                                        <item.icon/>
                                                        <span>{item.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="search-container">
                                <input type="text" className="search-input" placeholder="Search products..."
                                       value={searchText} onChange={(e) => setSearchText(e.target.value)}
                                       onKeyDown={(e) => e.key === 'Enter' && handleSearch()} autoFocus/>
                                <button className="search-btn" onClick={handleSearch}>
                                    <FaSearch/>
                                </button>
                                <button className="close-btn" onClick={() => setSearchActive(false)}>
                                    <FaTimes/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Bottom Navigation */}
            <div className="bottom-navigation">
                {bottomNavItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = item.id === 'search'
                        ? searchActive
                        : activeBottomTab === item.id;

                    return (
                        <button key={item.id} className={`bottom-nav-item ${
                            isActive ? 'active' : ''
                        } ${item.id === 'search' && searchActive ? 'search-close' : ''}`}
                                onClick={() => handleBottomNav(item.id)}>
                            {item.count !== undefined ? (
                                <IconWithBadge icon={IconComponent} count={item.count} className="bottom-icon"/>
                            ) : (
                                <IconComponent className="bottom-icon"/>
                            )}
                            <span className="bottom-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default Navbar;









// import React, {useState, useEffect, useRef} from 'react';
// import {
//     FaUserCircle, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaChevronDown,
//     FaBars, FaHome, FaBox, FaUser, FaCog, FaSignOutAlt, FaClipboardList, FaQuestionCircle,
// } from 'react-icons/fa';
// import {Link, useNavigate, useLocation} from 'react-router-dom';
// import './navbar.scss';
// import logo from '../../assets/my_logo.png';
// import path from '../../routes/path.jsx';
// import {useApp} from "../context/AppContext.jsx";
// import ApiUrlServices from "../network/ApiUrlServices.jsx";
// import AxiosServices from "../network/AxiosServices.jsx";
// import {toast} from "react-toastify";
// import {IoIosLogIn} from "react-icons/io";

// const Navbar = () => {
//     const [activeDropdown, setActiveDropdown] = useState(null);
//     const [searchActive, setSearchActive] = useState(false);
//     const [searchText, setSearchText] = useState('');
//     const [activeBottomTab, setActiveBottomTab] = useState('home');
//     const [userDropdownOpen, setUserDropdownOpen] = useState(false);
//     const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false);
//     const [user, setUser] = useState(null);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//     const userDropdownRef = useRef(null);
//     const mobileMenuRef = useRef(null);
//     const mobileUserDropdownRef = useRef(null);

//     // ✅ FIXED: Updated to use new context values
//     const {
//         cartCount, 
//         wishlistCount, 
//         isAuthenticated,  // Use isAuthenticated instead of isLoggedIn
//         updateAuthState,  // For updating auth state
//         getCartItems,     // For refreshing cart
//         getWishlistItems  // For refreshing wishlist
//     } = useApp();
    
//     const navigate = useNavigate();
//     const location = useLocation();

//     // Menu configuration
//     const menuItems = [
//         {name: 'Home', path: path.home},
//         {
//             name: 'Product', path: path.product,
//             dropdown: [
//                 {label: 'All Products', path: path.product},
//                 {label: 'Featured', path: '/products/featured'},
//                 {label: 'Best Sellers', path: '/products/bestsellers'},
//             ],
//         },
//         {name: 'About Us', path: '/about'},
//         {
//             name: 'Blog', path: '/blog',
//             dropdown: [
//                 {label: 'Latest Posts', path: '/blog/latest'},
//                 {label: 'Tutorials', path: '/blog/tutorials'},
//             ],
//         },
//         {
//             name: 'Pages', path: '/pages',
//             dropdown: [
//                 {label: 'FAQ', path: '/faq'},
//                 {label: 'Terms', path: '/terms'},
//                 {label: 'Privacy', path: '/privacy'},
//             ],
//         },
//         {name: 'Contact', path: '/contact'},
//     ];

//     const bottomNavItems = [
//         {id: 'home', icon: FaHome, label: 'Home', path: path.home},
//         {id: 'product', icon: FaBox, label: 'Product', path: path.product},
//         {id: 'search', icon: searchActive ? FaTimes : FaSearch, label: 'Search'},
//         {id: 'cart', icon: FaShoppingCart, label: 'Cart', count: cartCount, path: path.cart},
//         {id: 'wishlist', icon: FaHeart, label: 'Wishlist', count: wishlistCount, path: path.wishlist},
//     ];

//     const userMenuItems = [
//         {icon: FaUser, label: 'My Profile', path: '#'},
//         {icon: FaClipboardList, label: 'My Orders', path: path.orders},
//         {icon: FaHeart, label: 'Wishlist', path: path.wishlist},
//         {icon: FaCog, label: 'Settings', path: '#'},
//         {icon: FaQuestionCircle, label: 'Help & Support', path: '#'},
//         {icon: FaSignOutAlt, label: 'Logout', action: 'logout'},
//     ];

//     // Check if current path matches menu item
//     const isActiveMenu = (menuPath, dropdownItems = null) => {
//         if (menuPath === location.pathname) return true;

//         // Check dropdown items
//         if (dropdownItems) {
//             return dropdownItems.some(item => item.path === location.pathname);
//         }

//         return false;
//     };

//     // Check if current path matches submenu item
//     const isActiveSubmenu = (submenuPath) => {
//         return submenuPath === location.pathname;
//     };

//     // Update bottom tab based on current route
//     const updateBottomTabFromRoute = () => {
//         const currentPath = location.pathname;

//         // Find matching bottom nav item
//         const matchingTab = bottomNavItems.find(item => {
//             if (item.path) {
//                 return currentPath === item.path;
//             }
//             return false;
//         });

//         if (matchingTab) {
//             setActiveBottomTab(matchingTab.id);
//         } else {
//             // Check if current path matches any menu item to set appropriate bottom tab
//             const matchingMenu = menuItems.find(menu =>
//                 menu.path === currentPath ||
//                 (menu.dropdown && menu.dropdown.some(sub => sub.path === currentPath))
//             );

//             if (matchingMenu) {
//                 if (matchingMenu.name === 'Home') {
//                     setActiveBottomTab('home');
//                 } else if (matchingMenu.name === 'Product' ||
//                           (matchingMenu.dropdown && matchingMenu.dropdown.some(sub => sub.path === currentPath))) {
//                     setActiveBottomTab('product');
//                 } else {
//                     setActiveBottomTab('home'); // Default fallback
//                 }
//             }
//         }
//     };

//     // ✅ FIXED: Load user data with auth state dependency
//     useEffect(() => {
//         try {
//             const userData = JSON.parse(localStorage.getItem('user'));
//             if (userData?.token) {
//                 setUser({
//                     name: userData.name || userData.username || 'User',
//                     email: userData.email,
//                     avatar: userData.avatar || null,
//                 });
                
//                 // ✅ Refresh cart and wishlist data when user loads
//                 setTimeout(() => {
//                     getCartItems();
//                     getWishlistItems();
//                 }, 100);
//             }
//         } catch (error) {
//             console.error('Error loading user data:', error);
//         }
//     }, [isAuthenticated]); // ✅ Add isAuthenticated as dependency

//     // Update bottom tab when route changes
//     useEffect(() => {
//         updateBottomTabFromRoute();
//     }, [location.pathname]);

//     // Separate click outside handling for desktop and mobile user dropdowns
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             // Handle desktop user dropdown
//             if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
//                 setUserDropdownOpen(false);
//             }

//             // Handle mobile user dropdown separately
//             if (mobileUserDropdownRef.current && !mobileUserDropdownRef.current.contains(event.target)) {
//                 setMobileUserDropdownOpen(false);
//             }

//             // Handle mobile menu
//             if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
//                 setMobileMenuOpen(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     // Close mobile menu on window resize
//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth > 768) {
//                 setMobileMenuOpen(false);
//                 setMobileUserDropdownOpen(false);
//             }
//         };
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const handleSearch = () => {
//         if (searchText.trim()) {
//             navigate(`/search?query=${encodeURIComponent(searchText)}`);
//             setSearchActive(false);
//             setSearchText('');
//             setActiveBottomTab('home');
//         }
//     };

//     const handleBottomNav = (tabId) => {
//         if (tabId === 'search') {
//             if (searchActive) {
//                 setSearchActive(false);
//                 setSearchText('');
//             } else {
//                 setSearchActive(true);
//             }
//             return;
//         }

//         setSearchActive(false);
//         setSearchText('');
//         setActiveBottomTab(tabId);

//         const routes = {
//             home: path.home,
//             product: path.product,
//             cart: path.cart,
//             wishlist: path.wishlist
//         };
//         navigate(routes[tabId] || `/${tabId}`);
//     };

//     const handleNavigation = (navigatePath) => {
//         if (navigatePath && navigatePath !== '#') {
//             navigate(navigatePath);
//             setMobileMenuOpen(false);
//             setActiveDropdown(null);
//             setSearchActive(false);
//         }
//     };

//     // ✅ FIXED: Updated logout to immediately clear UI
//     const handleLogout = async () => {
//         try {
//             // ✅ IMMEDIATE: Clear UI state first for instant feedback
//             setUserDropdownOpen(false);
//             setMobileUserDropdownOpen(false);
//             setUser(null);
            
//             // ✅ Update context state (this will clear cart/wishlist immediately)
//             updateAuthState(null);
            
//             // Then make API call
//             await AxiosServices.post(ApiUrlServices.LOG_OUT);
            
//             navigate(path.login);
//             toast.success("Logout successful!");
//         } catch (error) {
//             // ✅ Even on error, ensure context is cleared
//             updateAuthState(null);
            
//             setUserDropdownOpen(false);
//             setMobileUserDropdownOpen(false);
//             setUser(null);
//             navigate(path.login);
//             toast.info(error.response?.status === 401 ? "Session expired." : "Logout completed locally.");
//         }
//     };

//     const handleUserMenu = (item) => {
//         if (item.action === 'logout') {
//             handleLogout();
//         } else if (item.path && item.path !== '#') {
//             navigate(item.path);
//         }
//         setUserDropdownOpen(false);
//         setMobileUserDropdownOpen(false);
//     };

//     // ✅ FIXED: Updated handlers to use isAuthenticated
//     const handleDesktopUserButtonClick = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
        
//         // If not logged in, navigate directly to login page
//         if (!isAuthenticated) {  // ✅ Use isAuthenticated instead of isLoggedIn()
//             navigate(path.login);
//             return;
//         }
        
//         // If logged in, toggle dropdown
//         setUserDropdownOpen(prev => !prev);
//         setMobileUserDropdownOpen(false);
//     };

//     const handleMobileUserButtonClick = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
        
//         // If not logged in, navigate directly to login page
//         if (!isAuthenticated) {  // ✅ Use isAuthenticated instead of isLoggedIn()
//             navigate(path.login);
//             return;
//         }
        
//         // If logged in, toggle dropdown
//         setMobileUserDropdownOpen(prev => !prev);
//         setUserDropdownOpen(false);
//     };

//     const IconWithBadge = ({icon: Icon, count, className, ...props}) => (
//         <div className="icon-badge-wrapper" {...props}>
//             <Icon className={className}/>
//             {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
//         </div>
//     );

//     return (
//         <>
//             {/* Modern Navbar */}
//             <nav className="modern-navbar">
//                 <div className={`navbar-container ${searchActive ? 'search-mode' : ''}`}>
//                     {/* Left Section - Logo */}
//                     <div className="navbar-left">
//                         <Link to="/" className="navbar-brand">
//                             <img src={logo} alt="Logo"/>
//                         </Link>
//                     </div>

//                     {/* Center Menu - Desktop */}
//                     {!searchActive && (
//                         <div className="navbar-center">
//                             <ul className="navbar-menu">
//                                 {menuItems.map((item, index) => (
//                                     <li key={index} className={`navbar-item ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
//                                         onMouseEnter={() => setActiveDropdown(index)}
//                                         onMouseLeave={() => setActiveDropdown(null)}>
//                                         <Link to={item.path || '#'} className={`navbar-link ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}>
//                                             {item.name}
//                                             {item.dropdown && <FaChevronDown className="dropdown-arrow"/>}
//                                         </Link>
//                                         {item.dropdown && activeDropdown === index && (
//                                             <div className="navbar-dropdown">
//                                                 {item.dropdown.map((subItem, subIndex) => (
//                                                     <Link key={subIndex} to={subItem.path}
//                                                           className={`dropdown-item ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
//                                                           onClick={(e) => {
//                                                               e.preventDefault();
//                                                               handleNavigation(subItem.path);
//                                                           }}>
//                                                         {subItem.label}
//                                                     </Link>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {/* Mobile Right Section - Hamburger and User Menu */}
//                     {!searchActive && (
//                         <div className="mobile-right-section">
//                             <div className="mobile-menu-wrapper" ref={mobileMenuRef}>
//                                 <button
//                                     className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
//                                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                                 >
//                                     <FaBars/>
//                                 </button>

//                                 {/* Mobile Menu Dropdown */}
//                                 {mobileMenuOpen && (
//                                     <div className="mobile-menu-dropdown">
//                                         <div className="mobile-menu-content">
//                                             {menuItems.map((item, index) => (
//                                                 <div key={index} className="mobile-menu-item">
//                                                     <button
//                                                         className={`mobile-menu-link ${activeDropdown === index ? 'dropdown-active' : ''} ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
//                                                         onClick={() => {
//                                                             if (item.dropdown) {
//                                                                 setActiveDropdown(activeDropdown === index ? null : index);
//                                                             } else {
//                                                                 handleNavigation(item.path);
//                                                             }
//                                                         }}
//                                                     >
//                                                         <span>{item.name}</span>
//                                                         {item.dropdown && (
//                                                             <FaChevronDown
//                                                                 className={`dropdown-arrow ${activeDropdown === index ? 'rotated' : ''}`}
//                                                             />
//                                                         )}
//                                                     </button>

//                                                     {item.dropdown && activeDropdown === index && (
//                                                         <div className="mobile-submenu">
//                                                             {item.dropdown.map((subItem, subIndex) => (
//                                                                 <button
//                                                                     key={subIndex}
//                                                                     className={`mobile-submenu-link ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
//                                                                     onClick={() => handleNavigation(subItem.path)}
//                                                                 >
//                                                                     {subItem.label}
//                                                                 </button>
//                                                             ))}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             ))}

//                                             {/* ✅ Login section for mobile menu - Updated to use isAuthenticated */}
//                                             {!isAuthenticated && (
//                                                 <div className="mobile-menu-login">
//                                                     <button
//                                                         className="mobile-login-btn"
//                                                         onClick={() => {
//                                                             navigate(path.login);
//                                                             setMobileMenuOpen(false);
//                                                         }}
//                                                     >
//                                                         <IoIosLogIn/>
//                                                         <span>Login</span>
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Mobile User Menu */}
//                             <div className="mobile-user-menu" ref={mobileUserDropdownRef}>
//                                 <div className="user-menu">
//                                     <button
//                                         className={`action-btn user-btn ${mobileUserDropdownOpen ? 'active' : ''}`}
//                                         onClick={handleMobileUserButtonClick}
//                                     >
//                                         {isAuthenticated ? <FaUserCircle/> : <IoIosLogIn/>}
//                                     </button>

//                                     {/* ✅ Only show dropdown for logged in users - Updated to use isAuthenticated */}
//                                     {mobileUserDropdownOpen && isAuthenticated && user && (
//                                         <div className="user-dropdown">
//                                             <div className="user-header">
//                                                 <div className="user-avatar">
//                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
//                                                         <FaUserCircle/>}
//                                                 </div>
//                                                 <div className="user-details">
//                                                     <div className="user-name">{user.name}</div>
//                                                     <div className="user-email">{user.email}</div>
//                                                 </div>
//                                             </div>
//                                             <div className="user-menu-list">
//                                                 {userMenuItems.map((item, index) => (
//                                                     <button key={index}
//                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
//                                                             onClick={() => handleUserMenu(item)}>
//                                                         <item.icon/>
//                                                         <span>{item.label}</span>
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Right Actions - Desktop Icons and Search */}
//                     <div className={`navbar-right ${searchActive ? 'search-active' : ''}`}>
//                         {!searchActive ? (
//                             <>
//                                 <button className="action-btn desktop-only" onClick={() => setSearchActive(true)}>
//                                     <FaSearch/>
//                                 </button>

//                                 <Link to={path.wishlist} className="action-btn desktop-only">
//                                     <IconWithBadge icon={FaHeart} count={wishlistCount}/>
//                                 </Link>

//                                 <Link to={path.cart} className="action-btn desktop-only">
//                                     <IconWithBadge icon={FaShoppingCart} count={cartCount}/>
//                                 </Link>

//                                 {/* Desktop User Menu */}
//                                 <div className="user-menu" ref={userDropdownRef}>
//                                     <button
//                                         className={`action-btn user-btn ${userDropdownOpen ? 'active' : ''}`}
//                                         onClick={handleDesktopUserButtonClick}
//                                     >
//                                         {isAuthenticated ? <FaUserCircle/> : <IoIosLogIn/>}
//                                     </button>

//                                     {/* ✅ Only show dropdown for logged in users - Updated to use isAuthenticated */}
//                                     {userDropdownOpen && isAuthenticated && user && (
//                                         <div className="user-dropdown">
//                                             <div className="user-header">
//                                                 <div className="user-avatar">
//                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
//                                                         <FaUserCircle/>}
//                                                 </div>
//                                                 <div className="user-details">
//                                                     <div className="user-name">{user.name}</div>
//                                                     <div className="user-email">{user.email}</div>
//                                                 </div>
//                                             </div>
//                                             <div className="user-menu-list">
//                                                 {userMenuItems.map((item, index) => (
//                                                     <button key={index}
//                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
//                                                             onClick={() => handleUserMenu(item)}>
//                                                         <item.icon/>
//                                                         <span>{item.label}</span>
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </>
//                         ) : (
//                             <div className="search-container">
//                                 <input type="text" className="search-input" placeholder="Search products..."
//                                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
//                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} autoFocus/>
//                                 <button className="search-btn" onClick={handleSearch}>
//                                     <FaSearch/>
//                                 </button>
//                                 <button className="close-btn" onClick={() => setSearchActive(false)}>
//                                     <FaTimes/>
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </nav>

//             {/* Bottom Navigation */}
//             <div className="bottom-navigation">
//                 {bottomNavItems.map((item) => {
//                     const IconComponent = item.icon;
//                     const isActive = item.id === 'search'
//                         ? searchActive
//                         : activeBottomTab === item.id;

//                     return (
//                         <button key={item.id} className={`bottom-nav-item ${
//                             isActive ? 'active' : ''
//                         } ${item.id === 'search' && searchActive ? 'search-close' : ''}`}
//                                 onClick={() => handleBottomNav(item.id)}>
//                             {item.count !== undefined ? (
//                                 <IconWithBadge icon={IconComponent} count={item.count} className="bottom-icon"/>
//                             ) : (
//                                 <IconComponent className="bottom-icon"/>
//                             )}
//                             <span className="bottom-label">{item.label}</span>
//                         </button>
//                     );
//                 })}
//             </div>
//         </>
//     );
// };

// export default Navbar;


// // import React, {useState, useEffect, useRef} from 'react';
// // import {
// //     FaUserCircle, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaChevronDown,
// //     FaBars, FaHome, FaBox, FaUser, FaCog, FaSignOutAlt, FaClipboardList, FaQuestionCircle,
// // } from 'react-icons/fa';
// // import {Link, useNavigate, useLocation} from 'react-router-dom';
// // import './navbar.scss';
// // import logo from '../../assets/my_logo.png';
// // import path from '../../routes/path.jsx';
// // import {useApp} from "../context/AppContext.jsx";
// // import ApiUrlServices from "../network/ApiUrlServices.jsx";
// // import AxiosServices from "../network/AxiosServices.jsx";
// // import {toast} from "react-toastify";
// // import {IoIosLogIn} from "react-icons/io";

// // const Navbar = () => {
// //     const [activeDropdown, setActiveDropdown] = useState(null);
// //     const [searchActive, setSearchActive] = useState(false);
// //     const [searchText, setSearchText] = useState('');
// //     const [activeBottomTab, setActiveBottomTab] = useState('home');
// //     const [userDropdownOpen, setUserDropdownOpen] = useState(false);
// //     const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false);
// //     const [user, setUser] = useState(null);
// //     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// //     const userDropdownRef = useRef(null);
// //     const mobileMenuRef = useRef(null);
// //     const mobileUserDropdownRef = useRef(null);

// //     // ✅ FIXED: Updated to use new context values
// //     const {
// //         cartCount, 
// //         wishlistCount, 
// //         isAuthenticated,  // Use isAuthenticated instead of isLoggedIn
// //         updateAuthState,  // For updating auth state
// //         getCartItems,     // For refreshing cart
// //         getWishlistItems  // For refreshing wishlist
// //     } = useApp();
    
// //     const navigate = useNavigate();
// //     const location = useLocation();

// //     // Menu configuration
// //     const menuItems = [
// //         {name: 'Home', path: path.home},
// //         {
// //             name: 'Product', path: path.product,
// //             dropdown: [
// //                 {label: 'All Products', path: path.product},
// //                 {label: 'Featured', path: '/products/featured'},
// //                 {label: 'Best Sellers', path: '/products/bestsellers'},
// //             ],
// //         },
// //         {name: 'About Us', path: '/about'},
// //         {
// //             name: 'Blog', path: '/blog',
// //             dropdown: [
// //                 {label: 'Latest Posts', path: '/blog/latest'},
// //                 {label: 'Tutorials', path: '/blog/tutorials'},
// //             ],
// //         },
// //         {
// //             name: 'Pages', path: '/pages',
// //             dropdown: [
// //                 {label: 'FAQ', path: '/faq'},
// //                 {label: 'Terms', path: '/terms'},
// //                 {label: 'Privacy', path: '/privacy'},
// //             ],
// //         },
// //         {name: 'Contact', path: '/contact'},
// //     ];

// //     const bottomNavItems = [
// //         {id: 'home', icon: FaHome, label: 'Home', path: path.home},
// //         {id: 'product', icon: FaBox, label: 'Product', path: path.product},
// //         {id: 'search', icon: searchActive ? FaTimes : FaSearch, label: 'Search'},
// //         {id: 'cart', icon: FaShoppingCart, label: 'Cart', count: cartCount, path: path.cart},
// //         {id: 'wishlist', icon: FaHeart, label: 'Wishlist', count: wishlistCount, path: path.wishlist},
// //     ];

// //     const userMenuItems = [
// //         {icon: FaUser, label: 'My Profile', path: '#'},
// //         {icon: FaClipboardList, label: 'My Orders', path: path.orders},
// //         {icon: FaHeart, label: 'Wishlist', path: path.wishlist},
// //         {icon: FaCog, label: 'Settings', path: '#'},
// //         {icon: FaQuestionCircle, label: 'Help & Support', path: '#'},
// //         {icon: FaSignOutAlt, label: 'Logout', action: 'logout'},
// //     ];

// //     // Check if current path matches menu item
// //     const isActiveMenu = (menuPath, dropdownItems = null) => {
// //         if (menuPath === location.pathname) return true;

// //         // Check dropdown items
// //         if (dropdownItems) {
// //             return dropdownItems.some(item => item.path === location.pathname);
// //         }

// //         return false;
// //     };

// //     // Check if current path matches submenu item
// //     const isActiveSubmenu = (submenuPath) => {
// //         return submenuPath === location.pathname;
// //     };

// //     // Update bottom tab based on current route
// //     const updateBottomTabFromRoute = () => {
// //         const currentPath = location.pathname;

// //         // Find matching bottom nav item
// //         const matchingTab = bottomNavItems.find(item => {
// //             if (item.path) {
// //                 return currentPath === item.path;
// //             }
// //             return false;
// //         });

// //         if (matchingTab) {
// //             setActiveBottomTab(matchingTab.id);
// //         } else {
// //             // Check if current path matches any menu item to set appropriate bottom tab
// //             const matchingMenu = menuItems.find(menu =>
// //                 menu.path === currentPath ||
// //                 (menu.dropdown && menu.dropdown.some(sub => sub.path === currentPath))
// //             );

// //             if (matchingMenu) {
// //                 if (matchingMenu.name === 'Home') {
// //                     setActiveBottomTab('home');
// //                 } else if (matchingMenu.name === 'Product' ||
// //                           (matchingMenu.dropdown && matchingMenu.dropdown.some(sub => sub.path === currentPath))) {
// //                     setActiveBottomTab('product');
// //                 } else {
// //                     setActiveBottomTab('home'); // Default fallback
// //                 }
// //             }
// //         }
// //     };

// //     // ✅ FIXED: Load user data with auth state dependency
// //     useEffect(() => {
// //         try {
// //             const userData = JSON.parse(localStorage.getItem('user'));
// //             if (userData?.token) {
// //                 setUser({
// //                     name: userData.name || userData.username || 'User',
// //                     email: userData.email,
// //                     avatar: userData.avatar || null,
// //                 });
                
// //                 // ✅ Refresh cart and wishlist data when user loads
// //                 setTimeout(() => {
// //                     getCartItems();
// //                     getWishlistItems();
// //                 }, 100);
// //             }
// //         } catch (error) {
// //             console.error('Error loading user data:', error);
// //         }
// //     }, [isAuthenticated]); // ✅ Add isAuthenticated as dependency

// //     // Update bottom tab when route changes
// //     useEffect(() => {
// //         updateBottomTabFromRoute();
// //     }, [location.pathname]);

// //     // Separate click outside handling for desktop and mobile user dropdowns
// //     useEffect(() => {
// //         const handleClickOutside = (event) => {
// //             // Handle desktop user dropdown
// //             if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
// //                 setUserDropdownOpen(false);
// //             }

// //             // Handle mobile user dropdown separately
// //             if (mobileUserDropdownRef.current && !mobileUserDropdownRef.current.contains(event.target)) {
// //                 setMobileUserDropdownOpen(false);
// //             }

// //             // Handle mobile menu
// //             if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
// //                 setMobileMenuOpen(false);
// //             }
// //         };

// //         document.addEventListener('mousedown', handleClickOutside);
// //         return () => document.removeEventListener('mousedown', handleClickOutside);
// //     }, []);

// //     // Close mobile menu on window resize
// //     useEffect(() => {
// //         const handleResize = () => {
// //             if (window.innerWidth > 768) {
// //                 setMobileMenuOpen(false);
// //                 setMobileUserDropdownOpen(false);
// //             }
// //         };
// //         window.addEventListener('resize', handleResize);
// //         return () => window.removeEventListener('resize', handleResize);
// //     }, []);

// //     const handleSearch = () => {
// //         if (searchText.trim()) {
// //             navigate(`/search?query=${encodeURIComponent(searchText)}`);
// //             setSearchActive(false);
// //             setSearchText('');
// //             setActiveBottomTab('home');
// //         }
// //     };

// //     const handleBottomNav = (tabId) => {
// //         if (tabId === 'search') {
// //             if (searchActive) {
// //                 setSearchActive(false);
// //                 setSearchText('');
// //             } else {
// //                 setSearchActive(true);
// //             }
// //             return;
// //         }

// //         setSearchActive(false);
// //         setSearchText('');
// //         setActiveBottomTab(tabId);

// //         const routes = {
// //             home: path.home,
// //             product: path.product,
// //             cart: path.cart,
// //             wishlist: path.wishlist
// //         };
// //         navigate(routes[tabId] || `/${tabId}`);
// //     };

// //     const handleNavigation = (navigatePath) => {
// //         if (navigatePath && navigatePath !== '#') {
// //             navigate(navigatePath);
// //             setMobileMenuOpen(false);
// //             setActiveDropdown(null);
// //             setSearchActive(false);
// //         }
// //     };

// //     // ✅ FIXED: Updated logout to immediately clear UI
// //     const handleLogout = async () => {
// //         try {
// //             // ✅ IMMEDIATE: Clear UI state first for instant feedback
// //             setUserDropdownOpen(false);
// //             setMobileUserDropdownOpen(false);
// //             setUser(null);
            
// //             // ✅ Update context state (this will clear cart/wishlist immediately)
// //             updateAuthState(null);
            
// //             // Then make API call
// //             await AxiosServices.post(ApiUrlServices.LOG_OUT);
            
// //             navigate(path.login);
// //             toast.success("Logout successful!");
// //         } catch (error) {
// //             // ✅ Even on error, ensure context is cleared
// //             updateAuthState(null);
            
// //             setUserDropdownOpen(false);
// //             setMobileUserDropdownOpen(false);
// //             setUser(null);
// //             navigate(path.login);
// //             toast.info(error.response?.status === 401 ? "Session expired." : "Logout completed locally.");
// //         }
// //     };

// //     const handleUserMenu = (item) => {
// //         if (item.action === 'logout') {
// //             handleLogout();
// //         } else if (item.path && item.path !== '#') {
// //             navigate(item.path);
// //         }
// //         setUserDropdownOpen(false);
// //         setMobileUserDropdownOpen(false);
// //     };

// //     // ✅ FIXED: Updated handlers to use isAuthenticated
// //     const handleDesktopUserButtonClick = (e) => {
// //         e.preventDefault();
// //         e.stopPropagation();
        
// //         // If not logged in, navigate directly to login page
// //         if (!isAuthenticated) {  // ✅ Use isAuthenticated instead of isLoggedIn()
// //             navigate(path.login);
// //             return;
// //         }
        
// //         // If logged in, toggle dropdown
// //         setUserDropdownOpen(prev => !prev);
// //         setMobileUserDropdownOpen(false);
// //     };

// //     const handleMobileUserButtonClick = (e) => {
// //         e.preventDefault();
// //         e.stopPropagation();
        
// //         // If not logged in, navigate directly to login page
// //         if (!isAuthenticated) {  // ✅ Use isAuthenticated instead of isLoggedIn()
// //             navigate(path.login);
// //             return;
// //         }
        
// //         // If logged in, toggle dropdown
// //         setMobileUserDropdownOpen(prev => !prev);
// //         setUserDropdownOpen(false);
// //     };

// //     const IconWithBadge = ({icon: Icon, count, className, ...props}) => (
// //         <div className="icon-badge-wrapper" {...props}>
// //             <Icon className={className}/>
// //             {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
// //         </div>
// //     );

// //     return (
// //         <>
// //             {/* Modern Navbar */}
// //             <nav className="modern-navbar">
// //                 <div className={`navbar-container ${searchActive ? 'search-mode' : ''}`}>
// //                     {/* Left Section - Logo */}
// //                     <div className="navbar-left">
// //                         <Link to="/" className="navbar-brand">
// //                             <img src={logo} alt="Logo"/>
// //                         </Link>
// //                     </div>

// //                     {/* Center Menu - Desktop */}
// //                     {!searchActive && (
// //                         <div className="navbar-center">
// //                             <ul className="navbar-menu">
// //                                 {menuItems.map((item, index) => (
// //                                     <li key={index} className={`navbar-item ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
// //                                         onMouseEnter={() => setActiveDropdown(index)}
// //                                         onMouseLeave={() => setActiveDropdown(null)}>
// //                                         <Link to={item.path || '#'} className={`navbar-link ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}>
// //                                             {item.name}
// //                                             {item.dropdown && <FaChevronDown className="dropdown-arrow"/>}
// //                                         </Link>
// //                                         {item.dropdown && activeDropdown === index && (
// //                                             <div className="navbar-dropdown">
// //                                                 {item.dropdown.map((subItem, subIndex) => (
// //                                                     <Link key={subIndex} to={subItem.path}
// //                                                           className={`dropdown-item ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
// //                                                           onClick={(e) => {
// //                                                               e.preventDefault();
// //                                                               handleNavigation(subItem.path);
// //                                                           }}>
// //                                                         {subItem.label}
// //                                                     </Link>
// //                                                 ))}
// //                                             </div>
// //                                         )}
// //                                     </li>
// //                                 ))}
// //                             </ul>
// //                         </div>
// //                     )}

// //                     {/* Mobile Right Section - Hamburger and User Menu */}
// //                     {!searchActive && (
// //                         <div className="mobile-right-section">
// //                             <div className="mobile-menu-wrapper" ref={mobileMenuRef}>
// //                                 <button
// //                                     className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
// //                                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
// //                                 >
// //                                     <FaBars/>
// //                                 </button>

// //                                 {/* Mobile Menu Dropdown */}
// //                                 {mobileMenuOpen && (
// //                                     <div className="mobile-menu-dropdown">
// //                                         <div className="mobile-menu-content">
// //                                             {menuItems.map((item, index) => (
// //                                                 <div key={index} className="mobile-menu-item">
// //                                                     <button
// //                                                         className={`mobile-menu-link ${activeDropdown === index ? 'dropdown-active' : ''} ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
// //                                                         onClick={() => {
// //                                                             if (item.dropdown) {
// //                                                                 setActiveDropdown(activeDropdown === index ? null : index);
// //                                                             } else {
// //                                                                 handleNavigation(item.path);
// //                                                             }
// //                                                         }}
// //                                                     >
// //                                                         <span>{item.name}</span>
// //                                                         {item.dropdown && (
// //                                                             <FaChevronDown
// //                                                                 className={`dropdown-arrow ${activeDropdown === index ? 'rotated' : ''}`}
// //                                                             />
// //                                                         )}
// //                                                     </button>

// //                                                     {item.dropdown && activeDropdown === index && (
// //                                                         <div className="mobile-submenu">
// //                                                             {item.dropdown.map((subItem, subIndex) => (
// //                                                                 <button
// //                                                                     key={subIndex}
// //                                                                     className={`mobile-submenu-link ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
// //                                                                     onClick={() => handleNavigation(subItem.path)}
// //                                                                 >
// //                                                                     {subItem.label}
// //                                                                 </button>
// //                                                             ))}
// //                                                         </div>
// //                                                     )}
// //                                                 </div>
// //                                             ))}

// //                                             {/* ✅ Login section for mobile menu - Updated to use isAuthenticated */}
// //                                             {!isAuthenticated && (
// //                                                 <div className="mobile-menu-login">
// //                                                     <button
// //                                                         className="mobile-login-btn"
// //                                                         onClick={() => {
// //                                                             navigate(path.login);
// //                                                             setMobileMenuOpen(false);
// //                                                         }}
// //                                                     >
// //                                                         <IoIosLogIn/>
// //                                                         <span>Login</span>
// //                                                     </button>
// //                                                 </div>
// //                                             )}
// //                                         </div>
// //                                     </div>
// //                                 )}
// //                             </div>

// //                             {/* Mobile User Menu */}
// //                             <div className="mobile-user-menu" ref={mobileUserDropdownRef}>
// //                                 <div className="user-menu">
// //                                     <button
// //                                         className={`action-btn user-btn ${mobileUserDropdownOpen ? 'active' : ''}`}
// //                                         onClick={handleMobileUserButtonClick}
// //                                     >
// //                                         {isAuthenticated ? <FaUserCircle/> : <IoIosLogIn/>}
// //                                     </button>

// //                                     {/* ✅ Only show dropdown for logged in users - Updated to use isAuthenticated */}
// //                                     {mobileUserDropdownOpen && isAuthenticated && user && (
// //                                         <div className="user-dropdown">
// //                                             <div className="user-header">
// //                                                 <div className="user-avatar">
// //                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
// //                                                         <FaUserCircle/>}
// //                                                 </div>
// //                                                 <div className="user-details">
// //                                                     <div className="user-name">{user.name}</div>
// //                                                     <div className="user-email">{user.email}</div>
// //                                                 </div>
// //                                             </div>
// //                                             <div className="user-menu-list">
// //                                                 {userMenuItems.map((item, index) => (
// //                                                     <button key={index}
// //                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
// //                                                             onClick={() => handleUserMenu(item)}>
// //                                                         <item.icon/>
// //                                                         <span>{item.label}</span>
// //                                                     </button>
// //                                                 ))}
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     )}

// //                     {/* Right Actions - Desktop Icons and Search */}
// //                     <div className={`navbar-right ${searchActive ? 'search-active' : ''}`}>
// //                         {!searchActive ? (
// //                             <>
// //                                 <button className="action-btn desktop-only" onClick={() => setSearchActive(true)}>
// //                                     <FaSearch/>
// //                                 </button>

// //                                 <Link to={path.wishlist} className="action-btn desktop-only">
// //                                     <IconWithBadge icon={FaHeart} count={wishlistCount}/>
// //                                 </Link>

// //                                 <Link to={path.cart} className="action-btn desktop-only">
// //                                     <IconWithBadge icon={FaShoppingCart} count={cartCount}/>
// //                                 </Link>

// //                                 {/* Desktop User Menu */}
// //                                 <div className="user-menu" ref={userDropdownRef}>
// //                                     <button
// //                                         className={`action-btn user-btn ${userDropdownOpen ? 'active' : ''}`}
// //                                         onClick={handleDesktopUserButtonClick}
// //                                     >
// //                                         {isAuthenticated ? <FaUserCircle/> : <IoIosLogIn/>}
// //                                     </button>

// //                                     {/* ✅ Only show dropdown for logged in users - Updated to use isAuthenticated */}
// //                                     {userDropdownOpen && isAuthenticated && user && (
// //                                         <div className="user-dropdown">
// //                                             <div className="user-header">
// //                                                 <div className="user-avatar">
// //                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
// //                                                         <FaUserCircle/>}
// //                                                 </div>
// //                                                 <div className="user-details">
// //                                                     <div className="user-name">{user.name}</div>
// //                                                     <div className="user-email">{user.email}</div>
// //                                                 </div>
// //                                             </div>
// //                                             <div className="user-menu-list">
// //                                                 {userMenuItems.map((item, index) => (
// //                                                     <button key={index}
// //                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
// //                                                             onClick={() => handleUserMenu(item)}>
// //                                                         <item.icon/>
// //                                                         <span>{item.label}</span>
// //                                                     </button>
// //                                                 ))}
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 </div>
// //                             </>
// //                         ) : (
// //                             <div className="search-container">
// //                                 <input type="text" className="search-input" placeholder="Search products..."
// //                                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
// //                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} autoFocus/>
// //                                 <button className="search-btn" onClick={handleSearch}>
// //                                     <FaSearch/>
// //                                 </button>
// //                                 <button className="close-btn" onClick={() => setSearchActive(false)}>
// //                                     <FaTimes/>
// //                                 </button>
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>
// //             </nav>

// //             {/* Bottom Navigation */}
// //             <div className="bottom-navigation">
// //                 {bottomNavItems.map((item) => {
// //                     const IconComponent = item.icon;
// //                     const isActive = item.id === 'search'
// //                         ? searchActive
// //                         : activeBottomTab === item.id;

// //                     return (
// //                         <button key={item.id} className={`bottom-nav-item ${
// //                             isActive ? 'active' : ''
// //                         } ${item.id === 'search' && searchActive ? 'search-close' : ''}`}
// //                                 onClick={() => handleBottomNav(item.id)}>
// //                             {item.count !== undefined ? (
// //                                 <IconWithBadge icon={IconComponent} count={item.count} className="bottom-icon"/>
// //                             ) : (
// //                                 <IconComponent className="bottom-icon"/>
// //                             )}
// //                             <span className="bottom-label">{item.label}</span>
// //                         </button>
// //                     );
// //                 })}
// //             </div>
// //         </>
// //     );
// // };

// // export default Navbar;











// // import React, {useState, useEffect, useRef} from 'react';
// // import {
// //     FaUserCircle, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaChevronDown,
// //     FaBars, FaHome, FaBox, FaUser, FaCog, FaSignOutAlt, FaClipboardList, FaQuestionCircle,
// // } from 'react-icons/fa';
// // import {Link, useNavigate, useLocation} from 'react-router-dom';
// // import './navbar.scss';
// // import logo from '../../assets/my_logo.png';
// // import path from '../../routes/path.jsx';
// // import {useApp} from "../context/AppContext.jsx";
// // import ApiUrlServices from "../network/ApiUrlServices.jsx";
// // import AxiosServices from "../network/AxiosServices.jsx";
// // import {toast} from "react-toastify";
// // import {IoIosLogIn} from "react-icons/io";

// // const Navbar = () => {
// //     const [activeDropdown, setActiveDropdown] = useState(null);
// //     const [searchActive, setSearchActive] = useState(false);
// //     const [searchText, setSearchText] = useState('');
// //     const [activeBottomTab, setActiveBottomTab] = useState('home');
// //     const [userDropdownOpen, setUserDropdownOpen] = useState(false);
// //     const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false); // Separate state for mobile
// //     const [user, setUser] = useState(null);
// //     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// //     const userDropdownRef = useRef(null);
// //     const mobileMenuRef = useRef(null);
// //     const mobileUserDropdownRef = useRef(null);

// //     const {cartCount, wishlistCount, isLoggedIn} = useApp();
// //     const navigate = useNavigate();
// //     const location = useLocation();

// //     // Menu configuration
// //     const menuItems = [
// //         {name: 'Home', path: path.home},
// //         {
// //             name: 'Product', path: path.product,
// //             dropdown: [
// //                 {label: 'All Products', path: path.product},
// //                 {label: 'Featured', path: '/products/featured'},
// //                 {label: 'Best Sellers', path: '/products/bestsellers'},
// //             ],
// //         },
// //         {name: 'About Us', path: '/about'},
// //         {
// //             name: 'Blog', path: '/blog',
// //             dropdown: [
// //                 {label: 'Latest Posts', path: '/blog/latest'},
// //                 {label: 'Tutorials', path: '/blog/tutorials'},
// //             ],
// //         },
// //         {
// //             name: 'Pages', path: '/pages',
// //             dropdown: [
// //                 {label: 'FAQ', path: '/faq'},
// //                 {label: 'Terms', path: '/terms'},
// //                 {label: 'Privacy', path: '/privacy'},
// //             ],
// //         },
// //         {name: 'Contact', path: '/contact'},
// //     ];

// //     const bottomNavItems = [
// //         {id: 'home', icon: FaHome, label: 'Home', path: path.home},
// //         {id: 'product', icon: FaBox, label: 'Product', path: path.product},
// //         {id: 'search', icon: searchActive ? FaTimes : FaSearch, label: 'Search'},
// //         {id: 'cart', icon: FaShoppingCart, label: 'Cart', count: cartCount, path: path.cart},
// //         {id: 'wishlist', icon: FaHeart, label: 'Wishlist', count: wishlistCount, path: path.wishlist},
// //     ];

// //     const userMenuItems = [
// //         {icon: FaUser, label: 'My Profile', path: '#'},
// //         {icon: FaClipboardList, label: 'My Orders', path: path.orders},
// //         {icon: FaHeart, label: 'Wishlist', path: path.wishlist},
// //         {icon: FaCog, label: 'Settings', path: '#'},
// //         {icon: FaQuestionCircle, label: 'Help & Support', path: '#'},
// //         {icon: FaSignOutAlt, label: 'Logout', action: 'logout'},
// //     ];

// //     // Check if current path matches menu item
// //     const isActiveMenu = (menuPath, dropdownItems = null) => {
// //         if (menuPath === location.pathname) return true;

// //         // Check dropdown items
// //         if (dropdownItems) {
// //             return dropdownItems.some(item => item.path === location.pathname);
// //         }

// //         return false;
// //     };

// //     // Check if current path matches submenu item
// //     const isActiveSubmenu = (submenuPath) => {
// //         return submenuPath === location.pathname;
// //     };

// //     // Update bottom tab based on current route
// //     const updateBottomTabFromRoute = () => {
// //         const currentPath = location.pathname;

// //         // Find matching bottom nav item
// //         const matchingTab = bottomNavItems.find(item => {
// //             if (item.path) {
// //                 return currentPath === item.path;
// //             }
// //             return false;
// //         });

// //         if (matchingTab) {
// //             setActiveBottomTab(matchingTab.id);
// //         } else {
// //             // Check if current path matches any menu item to set appropriate bottom tab
// //             const matchingMenu = menuItems.find(menu =>
// //                 menu.path === currentPath ||
// //                 (menu.dropdown && menu.dropdown.some(sub => sub.path === currentPath))
// //             );

// //             if (matchingMenu) {
// //                 if (matchingMenu.name === 'Home') {
// //                     setActiveBottomTab('home');
// //                 } else if (matchingMenu.name === 'Product' ||
// //                           (matchingMenu.dropdown && matchingMenu.dropdown.some(sub => sub.path === currentPath))) {
// //                     setActiveBottomTab('product');
// //                 } else {
// //                     setActiveBottomTab('home'); // Default fallback
// //                 }
// //             }
// //         }
// //     };

// //     // Load user data
// //     useEffect(() => {
// //         try {
// //             const userData = JSON.parse(localStorage.getItem('user'));
// //             if (userData?.token) {
// //                 setUser({
// //                     name: userData.name || userData.username || 'User',
// //                     email: userData.email,
// //                     avatar: userData.avatar || null,
// //                 });
// //             }
// //         } catch (error) {
// //             console.error('Error loading user data:', error);
// //         }
// //     }, []);

// //     // Update bottom tab when route changes
// //     useEffect(() => {
// //         updateBottomTabFromRoute();
// //     }, [location.pathname]);

// //     // FIXED: Separate click outside handling for desktop and mobile user dropdowns
// //     useEffect(() => {
// //         const handleClickOutside = (event) => {
// //             // Handle desktop user dropdown
// //             if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
// //                 setUserDropdownOpen(false);
// //             }

// //             // Handle mobile user dropdown separately
// //             if (mobileUserDropdownRef.current && !mobileUserDropdownRef.current.contains(event.target)) {
// //                 setMobileUserDropdownOpen(false);
// //             }

// //             // Handle mobile menu
// //             if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
// //                 setMobileMenuOpen(false);
// //             }
// //         };

// //         document.addEventListener('mousedown', handleClickOutside);
// //         return () => document.removeEventListener('mousedown', handleClickOutside);
// //     }, []);

// //     // Close mobile menu on window resize
// //     useEffect(() => {
// //         const handleResize = () => {
// //             if (window.innerWidth > 768) {
// //                 setMobileMenuOpen(false);
// //                 setMobileUserDropdownOpen(false); // Close mobile user dropdown on resize
// //             }
// //         };
// //         window.addEventListener('resize', handleResize);
// //         return () => window.removeEventListener('resize', handleResize);
// //     }, []);

// //     const handleSearch = () => {
// //         if (searchText.trim()) {
// //             navigate(`/search?query=${encodeURIComponent(searchText)}`);
// //             setSearchActive(false);
// //             setSearchText('');
// //             setActiveBottomTab('home'); // Reset to home after search
// //         }
// //     };

// //     const handleBottomNav = (tabId) => {
// //         if (tabId === 'search') {
// //             if (searchActive) {
// //                 setSearchActive(false);
// //                 setSearchText('');
// //                 // Don't change activeBottomTab here, keep current tab
// //             } else {
// //                 setSearchActive(true);
// //                 // Don't change activeBottomTab when opening search
// //             }
// //             return;
// //         }

// //         setSearchActive(false);
// //         setSearchText('');
// //         setActiveBottomTab(tabId);

// //         const routes = {
// //             home: path.home,
// //             product: path.product,
// //             cart: path.cart,
// //             wishlist: path.wishlist
// //         };
// //         navigate(routes[tabId] || `/${tabId}`);
// //     };

// //     const handleNavigation = (navigatePath) => {
// //         if (navigatePath && navigatePath !== '#') {
// //             navigate(navigatePath);
// //             setMobileMenuOpen(false);
// //             setActiveDropdown(null);
// //             setSearchActive(false); // Close search when navigating
// //         }
// //     };

// //     const handleLogout = async () => {
// //         try {
// //             await AxiosServices.post(ApiUrlServices.LOG_OUT);
// //             localStorage.removeItem('user');
// //             setUserDropdownOpen(false);
// //             setMobileUserDropdownOpen(false); // Close both dropdowns
// //             setUser(null);
// //             navigate(path.login);
// //             toast.success("Logout successful!");
// //         } catch (error) {
// //             localStorage.removeItem('user');
// //             setUserDropdownOpen(false);
// //             setMobileUserDropdownOpen(false); // Close both dropdowns
// //             setUser(null);
// //             navigate(path.login);
// //             toast.info(error.response?.status === 401 ? "Session expired." : "Logout completed locally.");
// //         }
// //     };

// //     const handleUserMenu = (item) => {
// //         if (item.action === 'logout') {
// //             handleLogout();
// //         } else if (item.path && item.path !== '#') {
// //             navigate(item.path);
// //         }
// //         setUserDropdownOpen(false);
// //         setMobileUserDropdownOpen(false); // Close both dropdowns
// //     };

// //     // FIXED: Updated handlers for login functionality
// //     const handleDesktopUserButtonClick = (e) => {
// //         e.preventDefault();
// //         e.stopPropagation();
        
// //         // If not logged in, navigate directly to login page
// //         if (!isLoggedIn()) {
// //             navigate(path.login);
// //             return;
// //         }
        
// //         // If logged in, toggle dropdown
// //         setUserDropdownOpen(prev => !prev);
// //         setMobileUserDropdownOpen(false); // Close mobile when opening desktop
// //     };

// //     const handleMobileUserButtonClick = (e) => {
// //         e.preventDefault();
// //         e.stopPropagation();
        
// //         // If not logged in, navigate directly to login page
// //         if (!isLoggedIn()) {
// //             navigate(path.login);
// //             return;
// //         }
        
// //         // If logged in, toggle dropdown
// //         setMobileUserDropdownOpen(prev => !prev);
// //         setUserDropdownOpen(false); // Close desktop when opening mobile
// //     };

// //     const IconWithBadge = ({icon: Icon, count, className, ...props}) => (
// //         <div className="icon-badge-wrapper" {...props}>
// //             <Icon className={className}/>
// //             {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
// //         </div>
// //     );

// //     return (
// //         <>
// //             {/* Modern Navbar */}
// //             <nav className="modern-navbar">
// //                 <div className={`navbar-container ${searchActive ? 'search-mode' : ''}`}>
// //                     {/* Left Section - Logo */}
// //                     <div className="navbar-left">
// //                         <Link to="/" className="navbar-brand">
// //                             <img src={logo} alt="Logo"/>
// //                         </Link>
// //                     </div>

// //                     {/* Center Menu - Desktop */}
// //                     {!searchActive && (
// //                         <div className="navbar-center">
// //                             <ul className="navbar-menu">
// //                                 {menuItems.map((item, index) => (
// //                                     <li key={index} className={`navbar-item ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
// //                                         onMouseEnter={() => setActiveDropdown(index)}
// //                                         onMouseLeave={() => setActiveDropdown(null)}>
// //                                         <Link to={item.path || '#'} className={`navbar-link ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}>
// //                                             {item.name}
// //                                             {item.dropdown && <FaChevronDown className="dropdown-arrow"/>}
// //                                         </Link>
// //                                         {item.dropdown && activeDropdown === index && (
// //                                             <div className="navbar-dropdown">
// //                                                 {item.dropdown.map((subItem, subIndex) => (
// //                                                     <Link key={subIndex} to={subItem.path}
// //                                                           className={`dropdown-item ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
// //                                                           onClick={(e) => {
// //                                                               e.preventDefault();
// //                                                               handleNavigation(subItem.path);
// //                                                           }}>
// //                                                         {subItem.label}
// //                                                     </Link>
// //                                                 ))}
// //                                             </div>
// //                                         )}
// //                                     </li>
// //                                 ))}
// //                             </ul>
// //                         </div>
// //                     )}

// //                     {/* Mobile Right Section - Hamburger and User Menu */}
// //                     {!searchActive && (
// //                         <div className="mobile-right-section">
// //                             <div className="mobile-menu-wrapper" ref={mobileMenuRef}>
// //                                 <button
// //                                     className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
// //                                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
// //                                 >
// //                                     <FaBars/>
// //                                 </button>

// //                                 {/* Mobile Menu Dropdown */}
// //                                 {mobileMenuOpen && (
// //                                     <div className="mobile-menu-dropdown">
// //                                         <div className="mobile-menu-content">
// //                                             {menuItems.map((item, index) => (
// //                                                 <div key={index} className="mobile-menu-item">
// //                                                     <button
// //                                                         className={`mobile-menu-link ${activeDropdown === index ? 'dropdown-active' : ''} ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
// //                                                         onClick={() => {
// //                                                             if (item.dropdown) {
// //                                                                 setActiveDropdown(activeDropdown === index ? null : index);
// //                                                             } else {
// //                                                                 handleNavigation(item.path);
// //                                                             }
// //                                                         }}
// //                                                     >
// //                                                         <span>{item.name}</span>
// //                                                         {item.dropdown && (
// //                                                             <FaChevronDown
// //                                                                 className={`dropdown-arrow ${activeDropdown === index ? 'rotated' : ''}`}
// //                                                             />
// //                                                         )}
// //                                                     </button>

// //                                                     {item.dropdown && activeDropdown === index && (
// //                                                         <div className="mobile-submenu">
// //                                                             {item.dropdown.map((subItem, subIndex) => (
// //                                                                 <button
// //                                                                     key={subIndex}
// //                                                                     className={`mobile-submenu-link ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
// //                                                                     onClick={() => handleNavigation(subItem.path)}
// //                                                                 >
// //                                                                     {subItem.label}
// //                                                                 </button>
// //                                                             ))}
// //                                                         </div>
// //                                                     )}
// //                                                 </div>
// //                                             ))}

// //                                             {/* Login section for mobile menu */}
// //                                             {!isLoggedIn() && (
// //                                                 <div className="mobile-menu-login">
// //                                                     <button
// //                                                         className="mobile-login-btn"
// //                                                         onClick={() => {
// //                                                             navigate(path.login);
// //                                                             setMobileMenuOpen(false);
// //                                                         }}
// //                                                     >
// //                                                         <IoIosLogIn/>
// //                                                         <span>Login</span>
// //                                                     </button>
// //                                                 </div>
// //                                             )}
// //                                         </div>
// //                                     </div>
// //                                 )}
// //                             </div>

// //                             {/* FIXED: Mobile User Menu - now directly navigates to login if not logged in */}
// //                             <div className="mobile-user-menu" ref={mobileUserDropdownRef}>
// //                                 <div className="user-menu">
// //                                     <button
// //                                         className={`action-btn user-btn ${mobileUserDropdownOpen ? 'active' : ''}`}
// //                                         onClick={handleMobileUserButtonClick}
// //                                     >
// //                                         {isLoggedIn() ? <FaUserCircle/> : <IoIosLogIn/>}
// //                                     </button>

// //                                     {/* Only show dropdown for logged in users */}
// //                                     {mobileUserDropdownOpen && isLoggedIn() && user && (
// //                                         <div className="user-dropdown">
// //                                             <div className="user-header">
// //                                                 <div className="user-avatar">
// //                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
// //                                                         <FaUserCircle/>}
// //                                                 </div>
// //                                                 <div className="user-details">
// //                                                     <div className="user-name">{user.name}</div>
// //                                                     <div className="user-email">{user.email}</div>
// //                                                 </div>
// //                                             </div>
// //                                             <div className="user-menu-list">
// //                                                 {userMenuItems.map((item, index) => (
// //                                                     <button key={index}
// //                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
// //                                                             onClick={() => handleUserMenu(item)}>
// //                                                         <item.icon/>
// //                                                         <span>{item.label}</span>
// //                                                     </button>
// //                                                 ))}
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     )}

// //                     {/* Right Actions - Desktop Icons and Search */}
// //                     <div className={`navbar-right ${searchActive ? 'search-active' : ''}`}>
// //                         {!searchActive ? (
// //                             <>
// //                                 <button className="action-btn desktop-only" onClick={() => setSearchActive(true)}>
// //                                     <FaSearch/>
// //                                 </button>

// //                                 <Link to={path.wishlist} className="action-btn desktop-only">
// //                                     <IconWithBadge icon={FaHeart} count={wishlistCount}/>
// //                                 </Link>

// //                                 <Link to={path.cart} className="action-btn desktop-only">
// //                                     <IconWithBadge icon={FaShoppingCart} count={cartCount}/>
// //                                 </Link>

// //                                 {/* Desktop User Menu - now directly navigates to login if not logged in */}
// //                                 <div className="user-menu" ref={userDropdownRef}>
// //                                     <button
// //                                         className={`action-btn user-btn ${userDropdownOpen ? 'active' : ''}`}
// //                                         onClick={handleDesktopUserButtonClick}
// //                                     >
// //                                         {isLoggedIn() ? <FaUserCircle/> : <IoIosLogIn/>}
// //                                     </button>

// //                                     {/* Only show dropdown for logged in users */}
// //                                     {userDropdownOpen && isLoggedIn() && user && (
// //                                         <div className="user-dropdown">
// //                                             <div className="user-header">
// //                                                 <div className="user-avatar">
// //                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
// //                                                         <FaUserCircle/>}
// //                                                 </div>
// //                                                 <div className="user-details">
// //                                                     <div className="user-name">{user.name}</div>
// //                                                     <div className="user-email">{user.email}</div>
// //                                                 </div>
// //                                             </div>
// //                                             <div className="user-menu-list">
// //                                                 {userMenuItems.map((item, index) => (
// //                                                     <button key={index}
// //                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
// //                                                             onClick={() => handleUserMenu(item)}>
// //                                                         <item.icon/>
// //                                                         <span>{item.label}</span>
// //                                                     </button>
// //                                                 ))}
// //                                             </div>
// //                                         </div>
// //                                     )}
// //                                 </div>
// //                             </>
// //                         ) : (
// //                             <div className="search-container">
// //                                 <input type="text" className="search-input" placeholder="Search products..."
// //                                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
// //                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} autoFocus/>
// //                                 <button className="search-btn" onClick={handleSearch}>
// //                                     <FaSearch/>
// //                                 </button>
// //                                 <button className="close-btn" onClick={() => setSearchActive(false)}>
// //                                     <FaTimes/>
// //                                 </button>
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>
// //             </nav>

// //             {/* Bottom Navigation */}
// //             <div className="bottom-navigation">
// //                 {bottomNavItems.map((item) => {
// //                     const IconComponent = item.icon;
// //                     const isActive = item.id === 'search'
// //                         ? searchActive
// //                         : activeBottomTab === item.id;

// //                     return (
// //                         <button key={item.id} className={`bottom-nav-item ${
// //                             isActive ? 'active' : ''
// //                         } ${item.id === 'search' && searchActive ? 'search-close' : ''}`}
// //                                 onClick={() => handleBottomNav(item.id)}>
// //                             {item.count !== undefined ? (
// //                                 <IconWithBadge icon={IconComponent} count={item.count} className="bottom-icon"/>
// //                             ) : (
// //                                 <IconComponent className="bottom-icon"/>
// //                             )}
// //                             <span className="bottom-label">{item.label}</span>
// //                         </button>
// //                     );
// //                 })}
// //             </div>
// //         </>
// //     );
// // };

// // export default Navbar;





// // // import React, {useState, useEffect, useRef} from 'react';
// // // import {
// // //     FaUserCircle, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaChevronDown,
// // //     FaBars, FaHome, FaBox, FaUser, FaCog, FaSignOutAlt, FaClipboardList, FaQuestionCircle,
// // // } from 'react-icons/fa';
// // // import {Link, useNavigate, useLocation} from 'react-router-dom';
// // // import './navbar.scss';
// // // import logo from '../../assets/my_logo.png';
// // // import path from '../../routes/path.jsx';
// // // import {useApp} from "../context/AppContext.jsx";
// // // import ApiUrlServices from "../network/ApiUrlServices.jsx";
// // // import AxiosServices from "../network/AxiosServices.jsx";
// // // import {toast} from "react-toastify";
// // // import {IoIosLogIn} from "react-icons/io";

// // // const Navbar = () => {
// // //     const [activeDropdown, setActiveDropdown] = useState(null);
// // //     const [searchActive, setSearchActive] = useState(false);
// // //     const [searchText, setSearchText] = useState('');
// // //     const [activeBottomTab, setActiveBottomTab] = useState('home');
// // //     const [userDropdownOpen, setUserDropdownOpen] = useState(false);
// // //     const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false); // Separate state for mobile
// // //     const [user, setUser] = useState(null);
// // //     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// // //     const userDropdownRef = useRef(null);
// // //     const mobileMenuRef = useRef(null);
// // //     const mobileUserDropdownRef = useRef(null);

// // //     const {cartCount, wishlistCount, isLoggedIn} = useApp();
// // //     const navigate = useNavigate();
// // //     const location = useLocation();

// // //     // Menu configuration
// // //     const menuItems = [
// // //         {name: 'Home', path: path.home},
// // //         {
// // //             name: 'Product', path: path.product,
// // //             dropdown: [
// // //                 {label: 'All Products', path: path.product},
// // //                 {label: 'Featured', path: '/products/featured'},
// // //                 {label: 'Best Sellers', path: '/products/bestsellers'},
// // //             ],
// // //         },
// // //         {name: 'About Us', path: '/about'},
// // //         {
// // //             name: 'Blog', path: '/blog',
// // //             dropdown: [
// // //                 {label: 'Latest Posts', path: '/blog/latest'},
// // //                 {label: 'Tutorials', path: '/blog/tutorials'},
// // //             ],
// // //         },
// // //         {
// // //             name: 'Pages', path: '/pages',
// // //             dropdown: [
// // //                 {label: 'FAQ', path: '/faq'},
// // //                 {label: 'Terms', path: '/terms'},
// // //                 {label: 'Privacy', path: '/privacy'},
// // //             ],
// // //         },
// // //         {name: 'Contact', path: '/contact'},
// // //     ];

// // //     const bottomNavItems = [
// // //         {id: 'home', icon: FaHome, label: 'Home', path: path.home},
// // //         {id: 'product', icon: FaBox, label: 'Product', path: path.product},
// // //         {id: 'search', icon: searchActive ? FaTimes : FaSearch, label: 'Search'},
// // //         {id: 'cart', icon: FaShoppingCart, label: 'Cart', count: cartCount, path: path.cart},
// // //         {id: 'wishlist', icon: FaHeart, label: 'Wishlist', count: wishlistCount, path: path.wishlist},
// // //     ];

// // //     const userMenuItems = [
// // //         {icon: FaUser, label: 'My Profile', path: '#'},
// // //         {icon: FaClipboardList, label: 'My Orders', path: path.orders},
// // //         {icon: FaHeart, label: 'Wishlist', path: path.wishlist},
// // //         {icon: FaCog, label: 'Settings', path: '#'},
// // //         {icon: FaQuestionCircle, label: 'Help & Support', path: '#'},
// // //         {icon: FaSignOutAlt, label: 'Logout', action: 'logout'},
// // //     ];

// // //     // Check if current path matches menu item
// // //     const isActiveMenu = (menuPath, dropdownItems = null) => {
// // //         if (menuPath === location.pathname) return true;

// // //         // Check dropdown items
// // //         if (dropdownItems) {
// // //             return dropdownItems.some(item => item.path === location.pathname);
// // //         }

// // //         return false;
// // //     };

// // //     // Check if current path matches submenu item
// // //     const isActiveSubmenu = (submenuPath) => {
// // //         return submenuPath === location.pathname;
// // //     };

// // //     // Update bottom tab based on current route
// // //     const updateBottomTabFromRoute = () => {
// // //         const currentPath = location.pathname;

// // //         // Find matching bottom nav item
// // //         const matchingTab = bottomNavItems.find(item => {
// // //             if (item.path) {
// // //                 return currentPath === item.path;
// // //             }
// // //             return false;
// // //         });

// // //         if (matchingTab) {
// // //             setActiveBottomTab(matchingTab.id);
// // //         } else {
// // //             // Check if current path matches any menu item to set appropriate bottom tab
// // //             const matchingMenu = menuItems.find(menu =>
// // //                 menu.path === currentPath ||
// // //                 (menu.dropdown && menu.dropdown.some(sub => sub.path === currentPath))
// // //             );

// // //             if (matchingMenu) {
// // //                 if (matchingMenu.name === 'Home') {
// // //                     setActiveBottomTab('home');
// // //                 } else if (matchingMenu.name === 'Product' ||
// // //                           (matchingMenu.dropdown && matchingMenu.dropdown.some(sub => sub.path === currentPath))) {
// // //                     setActiveBottomTab('product');
// // //                 } else {
// // //                     setActiveBottomTab('home'); // Default fallback
// // //                 }
// // //             }
// // //         }
// // //     };

// // //     // Load user data
// // //     useEffect(() => {
// // //         try {
// // //             const userData = JSON.parse(localStorage.getItem('user'));
// // //             if (userData?.token) {
// // //                 setUser({
// // //                     name: userData.name || userData.username || 'User',
// // //                     email: userData.email,
// // //                     avatar: userData.avatar || null,
// // //                 });
// // //             }
// // //         } catch (error) {
// // //             console.error('Error loading user data:', error);
// // //         }
// // //     }, []);

// // //     // Update bottom tab when route changes
// // //     useEffect(() => {
// // //         updateBottomTabFromRoute();
// // //     }, [location.pathname]);

// // //     // FIXED: Separate click outside handling for desktop and mobile user dropdowns
// // //     useEffect(() => {
// // //         const handleClickOutside = (event) => {
// // //             // Handle desktop user dropdown
// // //             if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
// // //                 setUserDropdownOpen(false);
// // //             }

// // //             // Handle mobile user dropdown separately
// // //             if (mobileUserDropdownRef.current && !mobileUserDropdownRef.current.contains(event.target)) {
// // //                 setMobileUserDropdownOpen(false);
// // //             }

// // //             // Handle mobile menu
// // //             if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
// // //                 setMobileMenuOpen(false);
// // //             }
// // //         };

// // //         document.addEventListener('mousedown', handleClickOutside);
// // //         return () => document.removeEventListener('mousedown', handleClickOutside);
// // //     }, []);

// // //     // Close mobile menu on window resize
// // //     useEffect(() => {
// // //         const handleResize = () => {
// // //             if (window.innerWidth > 768) {
// // //                 setMobileMenuOpen(false);
// // //                 setMobileUserDropdownOpen(false); // Close mobile user dropdown on resize
// // //             }
// // //         };
// // //         window.addEventListener('resize', handleResize);
// // //         return () => window.removeEventListener('resize', handleResize);
// // //     }, []);

// // //     const handleSearch = () => {
// // //         if (searchText.trim()) {
// // //             navigate(`/search?query=${encodeURIComponent(searchText)}`);
// // //             setSearchActive(false);
// // //             setSearchText('');
// // //             setActiveBottomTab('home'); // Reset to home after search
// // //         }
// // //     };

// // //     const handleBottomNav = (tabId) => {
// // //         if (tabId === 'search') {
// // //             if (searchActive) {
// // //                 setSearchActive(false);
// // //                 setSearchText('');
// // //                 // Don't change activeBottomTab here, keep current tab
// // //             } else {
// // //                 setSearchActive(true);
// // //                 // Don't change activeBottomTab when opening search
// // //             }
// // //             return;
// // //         }

// // //         setSearchActive(false);
// // //         setSearchText('');
// // //         setActiveBottomTab(tabId);

// // //         const routes = {
// // //             home: path.home,
// // //             product: path.product,
// // //             cart: path.cart,
// // //             wishlist: path.wishlist
// // //         };
// // //         navigate(routes[tabId] || `/${tabId}`);
// // //     };

// // //     const handleNavigation = (navigatePath) => {
// // //         if (navigatePath && navigatePath !== '#') {
// // //             navigate(navigatePath);
// // //             setMobileMenuOpen(false);
// // //             setActiveDropdown(null);
// // //             setSearchActive(false); // Close search when navigating
// // //         }
// // //     };

// // //     const handleLogout = async () => {
// // //         try {
// // //             await AxiosServices.post(ApiUrlServices.LOG_OUT);
// // //             localStorage.removeItem('user');
// // //             setUserDropdownOpen(false);
// // //             setMobileUserDropdownOpen(false); // Close both dropdowns
// // //             setUser(null);
// // //             navigate(path.login);
// // //             toast.success("Logout successful!");
// // //         } catch (error) {
// // //             localStorage.removeItem('user');
// // //             setUserDropdownOpen(false);
// // //             setMobileUserDropdownOpen(false); // Close both dropdowns
// // //             setUser(null);
// // //             navigate(path.login);
// // //             toast.info(error.response?.status === 401 ? "Session expired." : "Logout completed locally.");
// // //         }
// // //     };

// // //     const handleUserMenu = (item) => {
// // //         if (item.action === 'logout') {
// // //             handleLogout();
// // //         } else if (item.path && item.path !== '#') {
// // //             navigate(item.path);
// // //         }
// // //         setUserDropdownOpen(false);
// // //         setMobileUserDropdownOpen(false); // Close both dropdowns
// // //     };

// // //     // FIXED: Separate handlers for desktop and mobile user buttons
// // //     const handleDesktopUserButtonClick = (e) => {
// // //         e.preventDefault();
// // //         e.stopPropagation();
// // //         setUserDropdownOpen(prev => !prev);
// // //         setMobileUserDropdownOpen(false); // Close mobile when opening desktop
// // //     };

// // //     const handleMobileUserButtonClick = (e) => {
// // //         e.preventDefault();
// // //         e.stopPropagation();
// // //         setMobileUserDropdownOpen(prev => !prev);
// // //         setUserDropdownOpen(false); // Close desktop when opening mobile
// // //     };

// // //     const IconWithBadge = ({icon: Icon, count, className, ...props}) => (
// // //         <div className="icon-badge-wrapper" {...props}>
// // //             <Icon className={className}/>
// // //             {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
// // //         </div>
// // //     );

// // //     return (
// // //         <>
// // //             {/* Modern Navbar */}
// // //             <nav className="modern-navbar">
// // //                 <div className={`navbar-container ${searchActive ? 'search-mode' : ''}`}>
// // //                     {/* Left Section - Logo */}
// // //                     <div className="navbar-left">
// // //                         <Link to="/" className="navbar-brand">
// // //                             <img src={logo} alt="Logo"/>
// // //                         </Link>
// // //                     </div>

// // //                     {/* Center Menu - Desktop */}
// // //                     {!searchActive && (
// // //                         <div className="navbar-center">
// // //                             <ul className="navbar-menu">
// // //                                 {menuItems.map((item, index) => (
// // //                                     <li key={index} className={`navbar-item ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
// // //                                         onMouseEnter={() => setActiveDropdown(index)}
// // //                                         onMouseLeave={() => setActiveDropdown(null)}>
// // //                                         <Link to={item.path || '#'} className={`navbar-link ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}>
// // //                                             {item.name}
// // //                                             {item.dropdown && <FaChevronDown className="dropdown-arrow"/>}
// // //                                         </Link>
// // //                                         {item.dropdown && activeDropdown === index && (
// // //                                             <div className="navbar-dropdown">
// // //                                                 {item.dropdown.map((subItem, subIndex) => (
// // //                                                     <Link key={subIndex} to={subItem.path}
// // //                                                           className={`dropdown-item ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
// // //                                                           onClick={(e) => {
// // //                                                               e.preventDefault();
// // //                                                               handleNavigation(subItem.path);
// // //                                                           }}>
// // //                                                         {subItem.label}
// // //                                                     </Link>
// // //                                                 ))}
// // //                                             </div>
// // //                                         )}
// // //                                     </li>
// // //                                 ))}
// // //                             </ul>
// // //                         </div>
// // //                     )}

// // //                     {/* Mobile Right Section - Hamburger and User Menu */}
// // //                     {!searchActive && (
// // //                         <div className="mobile-right-section">
// // //                             <div className="mobile-menu-wrapper" ref={mobileMenuRef}>
// // //                                 <button
// // //                                     className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
// // //                                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
// // //                                 >
// // //                                     <FaBars/>
// // //                                 </button>

// // //                                 {/* Mobile Menu Dropdown */}
// // //                                 {mobileMenuOpen && (
// // //                                     <div className="mobile-menu-dropdown">
// // //                                         <div className="mobile-menu-content">
// // //                                             {menuItems.map((item, index) => (
// // //                                                 <div key={index} className="mobile-menu-item">
// // //                                                     <button
// // //                                                         className={`mobile-menu-link ${activeDropdown === index ? 'dropdown-active' : ''} ${isActiveMenu(item.path, item.dropdown) ? 'active' : ''}`}
// // //                                                         onClick={() => {
// // //                                                             if (item.dropdown) {
// // //                                                                 setActiveDropdown(activeDropdown === index ? null : index);
// // //                                                             } else {
// // //                                                                 handleNavigation(item.path);
// // //                                                             }
// // //                                                         }}
// // //                                                     >
// // //                                                         <span>{item.name}</span>
// // //                                                         {item.dropdown && (
// // //                                                             <FaChevronDown
// // //                                                                 className={`dropdown-arrow ${activeDropdown === index ? 'rotated' : ''}`}
// // //                                                             />
// // //                                                         )}
// // //                                                     </button>

// // //                                                     {item.dropdown && activeDropdown === index && (
// // //                                                         <div className="mobile-submenu">
// // //                                                             {item.dropdown.map((subItem, subIndex) => (
// // //                                                                 <button
// // //                                                                     key={subIndex}
// // //                                                                     className={`mobile-submenu-link ${isActiveSubmenu(subItem.path) ? 'active' : ''}`}
// // //                                                                     onClick={() => handleNavigation(subItem.path)}
// // //                                                                 >
// // //                                                                     {subItem.label}
// // //                                                                 </button>
// // //                                                             ))}
// // //                                                         </div>
// // //                                                     )}
// // //                                                 </div>
// // //                                             ))}

// // //                                             {/* Login section for mobile menu */}
// // //                                             {!isLoggedIn() && (
// // //                                                 <div className="mobile-menu-login">
// // //                                                     <button
// // //                                                         className="mobile-login-btn"
// // //                                                         onClick={() => {
// // //                                                             navigate(path.login);
// // //                                                             setMobileMenuOpen(false);
// // //                                                         }}
// // //                                                     >
// // //                                                         <IoIosLogIn/>
// // //                                                         <span>Login</span>
// // //                                                     </button>
// // //                                                 </div>
// // //                                             )}
// // //                                         </div>
// // //                                     </div>
// // //                                 )}
// // //                             </div>

// // //                             {/* FIXED: Mobile User Menu with separate ref and state */}
// // //                             <div className="mobile-user-menu" ref={mobileUserDropdownRef}>
// // //                                 <div className="user-menu">
// // //                                     <button
// // //                                         className={`action-btn user-btn ${mobileUserDropdownOpen ? 'active' : ''}`}
// // //                                         onClick={handleMobileUserButtonClick}
// // //                                     >
// // //                                         {isLoggedIn() ? <FaUserCircle/> : <IoIosLogIn/>}
// // //                                     </button>

// // //                                     {mobileUserDropdownOpen && isLoggedIn() && user && (
// // //                                         <div className="user-dropdown">
// // //                                             <div className="user-header">
// // //                                                 <div className="user-avatar">
// // //                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
// // //                                                         <FaUserCircle/>}
// // //                                                 </div>
// // //                                                 <div className="user-details">
// // //                                                     <div className="user-name">{user.name}</div>
// // //                                                     <div className="user-email">{user.email}</div>
// // //                                                 </div>
// // //                                             </div>
// // //                                             <div className="user-menu-list">
// // //                                                 {userMenuItems.map((item, index) => (
// // //                                                     <button key={index}
// // //                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
// // //                                                             onClick={() => handleUserMenu(item)}>
// // //                                                         <item.icon/>
// // //                                                         <span>{item.label}</span>
// // //                                                     </button>
// // //                                                 ))}
// // //                                             </div>
// // //                                         </div>
// // //                                     )}

// // //                                     {mobileUserDropdownOpen && !isLoggedIn() && (
// // //                                         <div className="login-dropdown">
// // //                                             <button className="login-btn" onClick={() => navigate(path.login)}>
// // //                                                 <IoIosLogIn/>
// // //                                                 <span>Login to your account</span>
// // //                                             </button>
// // //                                         </div>
// // //                                     )}
// // //                                 </div>
// // //                             </div>
// // //                         </div>
// // //                     )}

// // //                     {/* Right Actions - Desktop Icons and Search */}
// // //                     <div className={`navbar-right ${searchActive ? 'search-active' : ''}`}>
// // //                         {!searchActive ? (
// // //                             <>
// // //                                 <button className="action-btn desktop-only" onClick={() => setSearchActive(true)}>
// // //                                     <FaSearch/>
// // //                                 </button>

// // //                                 <Link to={path.wishlist} className="action-btn desktop-only">
// // //                                     <IconWithBadge icon={FaHeart} count={wishlistCount}/>
// // //                                 </Link>

// // //                                 <Link to={path.cart} className="action-btn desktop-only">
// // //                                     <IconWithBadge icon={FaShoppingCart} count={cartCount}/>
// // //                                 </Link>

// // //                                 {/* Desktop User Menu */}
// // //                                 <div className="user-menu" ref={userDropdownRef}>
// // //                                     <button
// // //                                         className={`action-btn user-btn ${userDropdownOpen ? 'active' : ''}`}
// // //                                         onClick={handleDesktopUserButtonClick}
// // //                                     >
// // //                                         {isLoggedIn() ? <FaUserCircle/> : <IoIosLogIn/>}
// // //                                     </button>

// // //                                     {userDropdownOpen && isLoggedIn() && user && (
// // //                                         <div className="user-dropdown">
// // //                                             <div className="user-header">
// // //                                                 <div className="user-avatar">
// // //                                                     {user.avatar ? <img src={user.avatar} alt="Avatar"/> :
// // //                                                         <FaUserCircle/>}
// // //                                                 </div>
// // //                                                 <div className="user-details">
// // //                                                     <div className="user-name">{user.name}</div>
// // //                                                     <div className="user-email">{user.email}</div>
// // //                                                 </div>
// // //                                             </div>
// // //                                             <div className="user-menu-list">
// // //                                                 {userMenuItems.map((item, index) => (
// // //                                                     <button key={index}
// // //                                                             className={`user-menu-item ${item.action === 'logout' ? 'logout' : ''}`}
// // //                                                             onClick={() => handleUserMenu(item)}>
// // //                                                         <item.icon/>
// // //                                                         <span>{item.label}</span>
// // //                                                     </button>
// // //                                                 ))}
// // //                                             </div>
// // //                                         </div>
// // //                                     )}

// // //                                     {userDropdownOpen && !isLoggedIn() && (
// // //                                         <div className="login-dropdown">
// // //                                             <button className="login-btn" onClick={() => navigate(path.login)}>
// // //                                                 <IoIosLogIn/>
// // //                                                 <span>Login to your account</span>
// // //                                             </button>
// // //                                         </div>
// // //                                     )}
// // //                                 </div>
// // //                             </>
// // //                         ) : (
// // //                             <div className="search-container">
// // //                                 <input type="text" className="search-input" placeholder="Search products..."
// // //                                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
// // //                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} autoFocus/>
// // //                                 <button className="search-btn" onClick={handleSearch}>
// // //                                     <FaSearch/>
// // //                                 </button>
// // //                                 <button className="close-btn" onClick={() => setSearchActive(false)}>
// // //                                     <FaTimes/>
// // //                                 </button>
// // //                             </div>
// // //                         )}
// // //                     </div>
// // //                 </div>
// // //             </nav>

// // //             {/* Bottom Navigation */}
// // //             <div className="bottom-navigation">
// // //                 {bottomNavItems.map((item) => {
// // //                     const IconComponent = item.icon;
// // //                     const isActive = item.id === 'search'
// // //                         ? searchActive
// // //                         : activeBottomTab === item.id;

// // //                     return (
// // //                         <button key={item.id} className={`bottom-nav-item ${
// // //                             isActive ? 'active' : ''
// // //                         } ${item.id === 'search' && searchActive ? 'search-close' : ''}`}
// // //                                 onClick={() => handleBottomNav(item.id)}>
// // //                             {item.count !== undefined ? (
// // //                                 <IconWithBadge icon={IconComponent} count={item.count} className="bottom-icon"/>
// // //                             ) : (
// // //                                 <IconComponent className="bottom-icon"/>
// // //                             )}
// // //                             <span className="bottom-label">{item.label}</span>
// // //                         </button>
// // //                     );
// // //                 })}
// // //             </div>
// // //         </>
// // //     );
// // // };

// // // export default Navbar;