const ApiUrlServices = {
    SIGN_UP: "signup",
    LOG_IN: "login",
    LOG_OUT: "logout",

    // product api
    ALL_PRODUCT_LIST: "products",
    ADD_PRODUCT: "products",
    SINGLE_PRODUCT_DETAILS: (id) => `products/${id}`,
    DELETE_PRODUCT: (id) => `/products/${id}`,
    UPDATE_PRODUCT: (id) => `/products/${id}`,

    // categories api
    All_CATEGORIES_LIST: "categories",
    ADD_CATEGORIES: "categories",
    UPDATE_CATEGORIES: (id) => `/categories/${id}`,
    DELETE_CATEGORIES: (id) => `/categories/${id}`,

    // cart api
    ALL_CART_LIST: "cart",
    ADD_CART: "cart",
    UPDATE_CART: (id) => `/cart/${id}`,
    DELETE_CART: (id) => `/cart/${id}`,

    // wishlist api
    ALL_WISHLIST_LIST: "wishlist",
    ADD_WISHLIST: "wishlist",
    DELETE_WISHLIST: (id) => `/wishlist/${id}`,

    // collection api
    All_COLLECTION: "collections",
    TITLE_COLLECTION: (slug) => `collections/${slug}`,
    // COLLECTIONS: `${BASE_URL}/collections`,
    // COLLECTION_BY_SLUG: (slug) => `${BASE_URL}/collections/${slug}`,
    // COLLECTION_CREATE: `${BASE_URL}/collections`,
    // COLLECTION_UPDATE: (id) => `${BASE_URL}/collections/${id}`,
    // COLLECTION_DELETE: (id) => `${BASE_URL}/collections/${id}`,

    // Order endpoints
    ORDERS: `orders`,
    ORDER_PLACE: `orders`,
    ORDER_BY_ID: (id) => `/orders/${id}`,
    ORDER_UPDATE_STATUS: (id) => `/orders/${id}/status`,

    // ssl ecommerze payment api
    PAYMENT_INIT: "payment/init",
    PAYMENT_SUCCESS: "api/payment/success",
    PAYMENT_FAIL: "payment/fail",
    PAYMENT_CANCEL: "api/payment/cancel",
    PAYMENT_IPN: `payment/ipn`,
}
export default ApiUrlServices