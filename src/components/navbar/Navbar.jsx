import React, {useState, useEffect, useRef} from 'react';
import {
    FaUserCircle,
    FaHeart,
    FaShoppingCart,
    FaSearch,
    FaTimes,
    FaChevronDown,
    FaBars,
    FaHome,
    FaBox,
    FaUser,
    FaCog,
    FaSignOutAlt,
    FaClipboardList,
    FaQuestionCircle,
    FaSignInAlt,
} from 'react-icons/fa';
import {Link, useNavigate} from 'react-router-dom';
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
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeBottomTab, setActiveBottomTab] = useState('home');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userDropdownRef = useRef(null);

    // App context থেকে cart, wishlist count এবং login status নিন
    const {cartCount, wishlistCount, isLoggedIn} = useApp();

    // User data - localStorage থেকে নিন
    const [user, setUser] = useState({
        name: 'Guest',
        email: 'guest@example.com',
        avatar: null,
    });

    const navigate = useNavigate();

    // Load user data from localStorage on component mount
    useEffect(() => {
        const loadUserData = () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData && userData.token) {
                    setUser({
                        name: userData.name || userData.username || 'User',
                        email: userData.email || 'user@example.com',
                        avatar: userData.avatar || null,
                    });
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

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

    // Updated menu items with proper dropdown routing
    const menuItems = [
        {name: 'Home', path: path.home},
        {
            name: 'Product',
            path: path.product,
            dropdown: [
                {label: 'All Products', path: path.product},
                {label: 'Featured', path: path.home},
                {label: 'Best Sellers', path: '#'},
            ],
        },
        {name: 'About Us', path: '#'},
        {
            name: 'Blog',
            path: '#',
            dropdown: [
                {label: 'Latest Posts', path: '#'},
                {label: 'Tutorials', path: '#'},
            ],
        },
        // {
        //     name: 'Categories',
        //     path: '/categories',
        //     dropdown: [
        //         {label: 'Men', path: '#'},
        //         {label: 'Women', path: '#'},
        //         {label: 'Kids', path: '#'},
        //     ],
        // },
        {
            name: 'Pages',
            path: '#',
            dropdown: [
                {label: 'FAQ', path: '#'},
                {label: 'Terms', path: '#'},
                {label: 'Privacy', path: '#'},
            ],
        },
        {name: 'Contact', path: '#'},
    ];

    const bottomNavItems = [
        {id: 'home', icon: FaHome, label: 'Home'},
        {id: 'product', icon: FaBox, label: 'Product'},
        {id: 'search', icon: searchActive ? FaTimes : FaSearch, label: 'Search'},
        {id: 'cart', icon: FaShoppingCart, label: 'Cart', count: cartCount},
        {id: 'wishlist', icon: FaHeart, label: 'Wishlist', count: wishlistCount},
    ];

    // User dropdown menu items - only show if logged in
    const userMenuItems = [
        {icon: FaUser, label: 'My Profile', path: '#'},
        {icon: FaClipboardList, label: 'My Orders', path: '#'},
        {icon: FaHeart, label: 'Wishlist', path: path.wishlist},
        {icon: FaCog, label: 'Settings', path: '#'},
        {icon: FaQuestionCircle, label: 'Help & Support', path: '#'},
        {icon: FaSignOutAlt, label: 'Logout', action: 'logout'},
    ];

    const handleSearch = () => {
        navigate(`/search?query=${encodeURIComponent(searchText)}`);
    };

    const handleBottomNavClick = (tabId) => {
        if (tabId === 'search') {
            if (searchActive) {
                handleSearchClose();
            } else {
                setSearchActive(true);
                setActiveBottomTab(tabId);
            }
        } else {
            setSearchActive(false);
            setSearchText('');
            setActiveBottomTab(tabId);

            // Navigate to appropriate routes
            if (tabId === 'home') {
                navigate('/');
            } else if (tabId === 'product') {
                navigate('/product');
            } else if (tabId === 'cart') {
                navigate('/cart');
            } else if (tabId === 'wishlist') {
                navigate('/wishlist');
            } else {
                navigate(`/${tabId}`);
            }
        }
    };

    const handleSearchClose = () => {
        setSearchActive(false);
        setSearchText('');
        setActiveBottomTab('home');
    };

    // New function to handle dropdown item clicks
    const handleDropdownClick = (dropdownItem, e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close the dropdown
        setActiveDropdown(null);

        // Navigate based on the path
        if (dropdownItem.path && dropdownItem.path !== '#') {
            navigate(dropdownItem.path);
        }
        // If path is '#', do nothing (stays on current page)
    };

    const handleLogout = async () => {
        try {
            // Call logout API
            await AxiosServices.post(ApiUrlServices.LOG_OUT);

            // Clear local storage
            localStorage.removeItem('user');

            // Reset user state
            setUser({
                name: 'Guest',
                email: 'guest@example.com',
                avatar: null,
            });

            // Close dropdown if open
            setShowUserDropdown(false);

            // Redirect to login page
            navigate(path.login);
            toast.success("Logout successful!");

        } catch (error) {
            console.error('Logout error:', error);

            // Even if API call fails, still logout locally for better UX
            localStorage.removeItem('user');
            setUser({
                name: 'Guest',
                email: 'guest@example.com',
                avatar: null,
            });
            setShowUserDropdown(false);
            navigate(path.login);

            // Show appropriate error message
            if (error.response?.status === 401) {
                toast.info("Session expired. Please login again.");
            } else {
                toast.warning("Logout completed locally. Please check your connection.");
            }
        }
    };

    const handleLogin = () => {
        navigate(path.login);
    };

    const handleUserMenuClick = (item) => {
        if (item.action === 'logout') {
            handleLogout();
        } else if (item.path) {
            navigate(item.path);
        }
        setShowUserDropdown(false);
    };

    // Icon with badge component
    const IconWithBadge = ({icon: Icon, count, className, ...props}) => (
        <div className="icon-with-badge" {...props}>
            <Icon className={className}/>
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
                            <FaBars/>
                        </div>
                        <div className="logo">
                            <img src={logo} alt="Logo"/>
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
                                            {item.name} {item.dropdown && <FaChevronDown className="arrow"/>}
                                        </Link>
                                        {item.dropdown && activeDropdown === index && (
                                            <ul className="dropdown">
                                                {item.dropdown.map((subItem, subIndex) => (
                                                    <li key={subIndex}>
                                                        <a
                                                            href="#"
                                                            onClick={(e) => handleDropdownClick(subItem, e)}
                                                            className="dropdown-link"
                                                        >
                                                            {subItem.label}
                                                        </a>
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
                                <FaSearch className="icon desktop-only" onClick={() => setSearchActive(true)}/>
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

                                {/* Conditional rendering based on login status */}
                                {isLoggedIn() ? (
                                    <div
                                        className="user-profile-wrapper"
                                        ref={userDropdownRef}
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    >
                                        <FaUserCircle className="icon user-icon"/>

                                        {showUserDropdown && (
                                            <div className="user-dropdown">
                                                <div className="user-info">
                                                    <div className="user-avatar">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="User Avatar"/>
                                                        ) : (
                                                            <FaUserCircle/>
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
                                                            <item.icon className="menu-icon"/>
                                                            <span>{item.label}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div onClick={handleLogin}>
                                        <IoIosLogIn className="icon user-icon"/>
                                    </div>
                                )}
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
                                    <FaSearch/>
                                </button>
                                <button className="close-btn" onClick={handleSearchClose}>
                                    <FaTimes/>
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
                    const isSearchClose = item.id === 'search' && searchActive;

                    return (
                        <div
                            key={item.id}
                            className={`bottom-nav-item ${
                                item.id === 'search'
                                    ? (searchActive ? 'active' : '')
                                    : (activeBottomTab === item.id ? 'active' : '')
                            }`}
                            data-search-close={isSearchClose}
                            onClick={() => handleBottomNavClick(item.id)}
                        >
                            {item.count !== undefined ? (
                                <div className="icon-with-badge">
                                    <IconComponent className="bottom-nav-icon"/>
                                    {item.count > 0 && (
                                        <span className="badge-counter">{item.count > 99 ? '99+' : item.count}</span>
                                    )}
                                </div>
                            ) : (
                                <IconComponent className="bottom-nav-icon"/>
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
                                <img src={logo} alt="Logo"/>
                            </div>
                            <FaTimes className="close-btn" onClick={() => setMobileSidebarOpen(false)}/>
                        </div>
                        <ul>
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <Link to={item.path || '#'}>{item.name}</Link>
                                    {item.dropdown && (
                                        <ul className="dropdown">
                                            {item.dropdown.map((subItem, subIndex) => (
                                                <li key={subIndex}>
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (subItem.path && subItem.path !== '#') {
                                                                navigate(subItem.path);
                                                                setMobileSidebarOpen(false);
                                                            }
                                                        }}
                                                    >
                                                        {subItem.label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Mobile Login/User Section */}
                        <div className="mobile-user-section">
                            {isLoggedIn() ? (
                                <div className="mobile-user-info">
                                    <div className="user-avatar">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="User Avatar"/>
                                        ) : (
                                            <FaUserCircle/>
                                        )}
                                    </div>
                                    <div className="user-details">
                                        <h4>{user.name}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                    <button className="mobile-logout-btn" onClick={handleLogout}>
                                        <FaSignOutAlt/>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div onClick={handleLogin}>
                                    <IoIosLogIn className="icon user-icon"/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;