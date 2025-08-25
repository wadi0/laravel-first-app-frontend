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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await AxiosServices.get(ApiUrlServices.All_CATEGORIES_LIST);
                console.log('Full API Response:', res.data);

                // Extract actual categories array
                const categories = res.data.data.data || [];

                console.log('Extracted categories:', categories);
                setCategoryList(categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                if (error.response?.status !== 401) {
                    toast.error('Failed to load categories');
                }
            }
        };
        fetchCategories();
    }, []);

    // Fetch products when page or category changes
    useEffect(() => {
        console.log('useEffect triggered - currentPage:', currentPage, 'selectedCategory:', selectedCategory, 'itemsPerPage:', itemsPerPage);
        getAllProductList();
    }, [currentPage, selectedCategory, itemsPerPage]);

    // API call with pagination parameters
    const getAllProductList = async () => {
        console.log('getAllProductList called');
        console.log('Current selectedCategory:', selectedCategory);
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: itemsPerPage.toString()
            });

            // Add category filter if selected
            if (selectedCategory) {
                console.log('Adding category filter:', selectedCategory);
                params.append('category_id', selectedCategory);
            }

            const apiUrl = `${ApiUrlServices.ALL_PRODUCT_LIST}?${params}`;
            console.log('Final API URL:', apiUrl);

            const res = await AxiosServices.get(apiUrl);
            console.log('API Response:', res.data);
            console.log('Products returned:', res.data.data.length);

            // Laravel pagination response structure
            setProductList(res.data.data); // Current page products
            setFilteredProducts(res.data.data); // For display
            setTotalPages(res.data.last_page); // Total pages
            setTotalItems(res.data.total); // Total items

        } catch (err) {
            console.error('Error fetching products:', err);
            // If not authentication error, show toast
            if (err.response?.status !== 401) {
                toast.error('Failed to load products');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        console.log('Category changed to:', e.target.value);
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Cart operations with authentication check and toast messages
    // Use useCallback to prevent re-creation on every render
    const handleAddToCart = useCallback(async (product) => {
        try {
            const success = await addToCart(product);
            if (success) {
                toast.success("Product added to cart!");
                // Refresh the product list to ensure UI consistency
                // But don't await it to avoid blocking the UI
                setTimeout(() => {
                    // Force a re-render by updating a state that doesn't affect the API call
                    setProductList(prev => [...prev]);
                }, 100);
            }
            return success;
        } catch (error) {
            console.error('Add to cart error:', error);
            return false;
        }
    }, [addToCart]);

    const handleRemoveFromCart = useCallback(async (product) => {
        try {
            const success = await removeFromCart(product);
            if (success) {
                toast.success("Remove from cart successfully!");
                // Force a re-render to ensure UI consistency
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

    // Wishlist operations with authentication check
    const handleWishlist = useCallback(async (product) => {
        try {
            const result = await toggleWishlist(product);
            // Force a re-render to ensure UI consistency
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

    // Handle pagination change using CustomPagination
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle items per page change using CustomPagination
    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(1); // Reset to first page
    };

    // Extract categories array - safe handling
    const categoriesArray = Array.isArray(categoryList) ? categoryList : [];

    const categoryOptions = [
        {label: 'All Categories', value: ''},
        ...categoriesArray.map((item) => ({
            label: item.category_name?.toUpperCase() || 'Unknown',
            value: item.id,
        }))
    ];

    console.log('categoryList:', categoryList);
    console.log('categoriesArray:', categoriesArray);
    console.log('categoryOptions:', categoryOptions);

    return (
        <div className="product-wrapper">
            <div className="top-bar">
                <div className="filter-section">
                    <CustomSelect
                        id="category-filter-select"
                        name="category_id"
                        label="Filter by Category"
                        placeholder="Please select category"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        disabled={loading}
                    />

                    {/* Results count */}
                    {!loading && (
                        <div className="results-count">
                            <span>
                                Showing {filteredProducts.length} of {totalItems} products
                                {selectedCategory && (
                                    <span className="category-filter">
                                        {' '}in {categoriesArray.find(cat => cat.id === parseInt(selectedCategory))?.category_name || 'Selected Category'}
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </div>

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
                    <div className="product-container">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={`product-${product.id}-${cartItems.length}-${Date.now()}`} // Force re-render with timestamp
                                product={product}
                                cartItems={cartItems || []}
                                onAddToCart={handleAddToCart}
                                onRemoveFromCart={handleRemoveFromCart}
                                onWishlist={handleWishlist}
                            />
                        ))}
                    </div>

                    {/* Custom Pagination Component */}
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