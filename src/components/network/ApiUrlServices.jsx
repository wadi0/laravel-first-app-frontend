const ApiUrlServices = {
    SIGN_UP: "signup",
    LOG_IN: "login",
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
    DELETE_CART: (id) => `/cart/${id}`,
    // wishlist api
    ALL_WISHLIST_LIST: "wishlist",
    ADD_WISHLIST: "wishlist",
    DELETE_WISHLIST: (id) => `/wishlist/${id}`,
}
export default ApiUrlServices