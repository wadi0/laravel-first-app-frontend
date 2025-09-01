import React, {useEffect, useState, useCallback} from 'react';
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import "./product.scss";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomModal from "../../components/custommodal/CustomModal.jsx";
import AddProduct from "./AddProduct.jsx";
import CustomSelect from "../../components/customselect/CustomSelect.jsx";
import ProductCard from "./ProductCard.jsx";
import {toast} from "react-toastify";
import {useApp} from "../../components/context/AppContext.jsx";
import CustomPagination from "../../components/pagination/Pagination.jsx";

const Product = () => {
    const [productList, setProductList] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // API Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // App context থেকে functions এবং data নিন
    const { cartItems, addToCart, removeFromCart, toggleWishlist } = useApp();

    // Debug: Context data check করুন
    useEffect(() => {
        console.log('Cart Items in Product component:', cartItems);
    }, [cartItems]);

    const toggleModal = () => {
        setShowModal(!showModal);
        if (showModal) {
            setEditingProduct(null);
        }
    };

    // ✅ সব categories একসাথে fetch করার function (কোনো limit ছাড়া)
    const fetchAllCategories = async () => {
        try {
            setCategoriesLoading(true);
            let allCategories = [];
            let currentPage = 1;
            let hasMorePages = true;

            console.log('🔄 Starting to fetch ALL categories...');

            // যত pages লাগুক সব categories নিয়ে আসব
            while (hasMorePages) {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    per_page: '100' // Maximum per page যা API support করে
                });

                const apiUrl = `${ApiUrlServices.All_CATEGORIES_LIST}?${params}`;

                const res = await AxiosServices.get(apiUrl);

                const categoriesData = res.data.data.data || [];
                const currentPageNum = res.data.data.current_page;
                const lastPage = res.data.data.last_page;
                const total = res.data.data.total;
                allCategories = [...allCategories, ...categoriesData];
                hasMorePages = currentPage < lastPage;
                currentPage++;
            }
            setCategoryList(allCategories);
            // toast.success('Categories loaded successfully!');

        } catch (error) {
            toast.error('Failed to load categories');
            setCategoryList([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const getAllProductList = async () => {
        setLoading(true);
        try {
            // Query parameters build করি
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: itemsPerPage.toString()
            });

            // Category filter add করি যদি select করা থাকে
            if (selectedCategory) {
                params.append('category_id', selectedCategory);
            }

            const apiUrl = `${ApiUrlServices.ALL_PRODUCT_LIST}?${params}`;

            const res = await AxiosServices.get(apiUrl);

            // Laravel pagination response structure
            setProductList(res.data.data); // Current page products
            setFilteredProducts(res.data.data); // For display
            setTotalPages(res.data.last_page); // Total pages
            setTotalItems(res.data.total); // Total items
            // toast.success('Product loaded successfully!');

        } catch (err) {
            if (err.response?.status !== 401) {
                toast.error('Failed to load products');
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ শুধুমাত্র একবার categories load করি component mount এ
    useEffect(() => {
        fetchAllCategories();
    }, []); // শুধুমাত্র component mount এ একবার

    // ✅ Products fetch করার useEffect (pagination সহ)
    useEffect(() => {
        getAllProductList();
    }, [currentPage, selectedCategory, itemsPerPage]);

    // Category change handler
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Filter করার সময় first page এ যাই
    };

    // Cart operations
    const handleAddToCart = useCallback(async (product) => {
        try {
            const success = await addToCart(product);
            if (success) {
                // toast.success("Product added to cart!");
                setTimeout(() => {
                    setProductList(prev => [...prev]);
                }, 100);
            }
            return success;
        } catch (error) {
            toast.error("Something went wrong!");
            return false;
        }
    }, [addToCart]);

    const handleRemoveFromCart = useCallback(async (product) => {
        try {
            const success = await removeFromCart(product);
            if (success) {
                // toast.success("Remove from cart successfully!");
                setTimeout(() => {
                    setProductList(prev => [...prev]);
                }, 100);
            }
            return success;
        } catch (error) {
            console.error('Remove from cart error:', error);
            return false;
        }
    }, [removeFromCart]);

    const handleWishlist = useCallback(async (product) => {
        try {
            const result = await toggleWishlist(product);
            if (result.success) {
                setTimeout(() => {
                    setProductList(prev => [...prev]);
                }, 100);
            }
            return result.success;
        } catch (error) {
            console.error('Wishlist error:', error);
            return false;
        }
    }, [toggleWishlist]);

    // Pagination handlers
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    };

    // Safe categories array handling
    const categoriesArray = Array.isArray(categoryList) ? categoryList : [];

    // Select dropdown এর জন্য options তৈরি
    const categoryOptions = [
        {label: 'All Categories', value: ''},
        ...categoriesArray.map((item) => ({
            label: item.category_name?.toUpperCase() || 'Unknown',
            value: item.id.toString(), // ID string হিসেবে পাঠাই
        }))
    ];

    return (
        <div className="product-wrapper">
            <div className="top-bar">
                <div className="filter-section">
                    {/* Category Filter Select */}
                    <CustomSelect
                        id="category-filter-select"
                        name="category_id"
                        label="Filter by Category"
                        placeholder={categoriesLoading ? "Loading categories..." : "Please select category"}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        disabled={loading || categoriesLoading}
                    />

                    {/* Products count */}
                    {!loading && (
                        <div className="results-count">
                            <span>
                                Showing {filteredProducts.length} of {totalItems} products
                                {selectedCategory && (
                                    <span className="category-filter">
                                        {' '}in {categoriesArray.find(cat => cat.id.toString() === selectedCategory)?.category_name || 'Selected Category'}
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Content */}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                    <div className="no-products-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="m1 1 4 4 5.8 13.4a2 2 0 0 0 1.9 1.3h9.9a2 2 0 0 0 1.9-1.4L21.4 6H7"></path>
                            <path d="m7 18 10-10"></path>
                        </svg>
                    </div>
                    <h3>No products found</h3>
                    <p>
                        {selectedCategory
                            ? 'No products found in the selected category. Try selecting a different category.'
                            : 'No products available at the moment. Check back later or add some products.'
                        }
                    </p>
                    {selectedCategory && (
                        <button
                            className="clear-filter-btn"
                            onClick={() => setSelectedCategory('')}
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Products Grid */}
                    <div className="product-container">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={`product-${product.id}-${cartItems.length}-${Date.now()}`}
                                product={product}
                                cartItems={cartItems || []}
                                onAddToCart={handleAddToCart}
                                onRemoveFromCart={handleRemoveFromCart}
                                onWishlist={handleWishlist}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        loading={loading}
                        showInfo={true}
                        showItemsPerPageSelector={true}
                        itemsPerPageOptions={[6, 12, 24, 48]}
                        size="large"
                        color="primary"
                        showFirstButton={true}
                        showLastButton={true}
                        siblingCount={2}
                        boundaryCount={1}
                        className="product-pagination"
                        disabled={false}
                    />
                </>
            )}

            {/* Add Product Modal */}
            <CustomModal
                isOpen={showModal}
                onClose={toggleModal}
                title="Add New Product"
            >
                <AddProduct
                    product={editingProduct}
                    onSuccess={() => {
                        getAllProductList();
                        toggleModal();
                    }}
                    categoryList={categoriesArray}
                />
            </CustomModal>
        </div>
    );
};

export default Product;