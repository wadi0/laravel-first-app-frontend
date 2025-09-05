const path = {
    login: "/sign-in",
    signup: "/sign-up",
    home: "/home",
    product: "/product",
    cart: '/cart',
    wishlist: '/wishlist',
    checkout: '/checkout',
    orders: '/orders',
    order_success: (orderId) => `/order-success/${orderId}`,
    order_success_route: '/order-success/:orderId',
    order_details_route: '/order-details/:orderId',
    order_details: (orderId) => `/order-details/${orderId}`,
    track_order: (orderId) => `/track-order/${orderId}`,
    track_order_route: '/track-order/:orderId',

    // Other routes
    about: '/about',
    contact: '/contact',
    profile: '/profile',
    settings: '/settings',
    support: '/support',
}

export default path;