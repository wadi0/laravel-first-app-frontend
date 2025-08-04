import React, {useEffect, useState} from 'react';
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
                setCategoryList(res.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products when page or category changes
    useEffect(() => {
        getAllProductList();
    }, [currentPage, selectedCategory, itemsPerPage]);

    // API call with pagination parameters
    const getAllProductList = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: itemsPerPage.toString()
            });

            // Add category filter if selected
            if (selectedCategory) {
                params.append('category_id', selectedCategory);
            }

            const res = await AxiosServices.get(`${ApiUrlServices.ALL_PRODUCT_LIST}?${params}`);
            console.log('API Response:', res.data);

            // Laravel pagination response structure
            setProductList(res.data.data); // Current page products
            setFilteredProducts(res.data.data); // For display
            setTotalPages(res.data.last_page); // Total pages
            setTotalItems(res.data.total); // Total items
            setCurrentPage(res.data.current_page); // Current page from API

        } catch (err) {
            console.error('Error fetching products:', err);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Cart operations with toast messages
    const handleAddToCart = async (product) => {
        const success = await addToCart(product);
        if (success) {
            toast.success("Product added to cart!");
        } else {
            toast.error("Add to cart failed");
        }
        return success;
    };

    const handleRemoveFromCart = async (product) => {
        const success = await removeFromCart(product);
        if (success) {
            toast.success("Remove from cart successfully!");
        } else {
            toast.error("Remove from cart failed");
        }
        return success;
    };

    // Wishlist operations
    const handleWishlist = async (product) => {
        const result = await toggleWishlist(product);
        return result.success;
    };

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

    const categoryOptions = [
        {label: 'All Categories', value: ''},
        ...categoryList.map((item) => ({
            label: item.name.toUpperCase(),
            value: item.id,
        }))
    ];

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
                                        {' '}in {categoryList.find(cat => cat.id === parseInt(selectedCategory))?.name}
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/*<CustomSubmitButton*/}
                {/*    isLoading={loading}*/}
                {/*    onClick={toggleModal}*/}
                {/*    type="button"*/}
                {/*    label="+ Add Product"*/}
                {/*    btnClassName="default-submit-btn"*/}
                {/*/>*/}
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
                                key={product.id}
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
                    categoryList={categoryList}
                />
            </CustomModal>
        </div>
    );
};

export default Product;