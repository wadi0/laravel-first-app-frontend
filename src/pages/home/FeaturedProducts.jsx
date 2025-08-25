import React, { useState, useEffect, useCallback } from 'react';
import './featuredProduct.scss';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import { useApp } from "../../components/context/AppContext.jsx";
import { toast } from "react-toastify";
import ProductCard from "../product/ProductCard.jsx"; // Import your existing ProductCard

const FeaturedProducts = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);

    const { cartItems, addToCart, removeFromCart, toggleWishlist } = useApp();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const res = await AxiosServices.get(ApiUrlServices.All_CATEGORIES_LIST);
                const categoriesData = res.data.data.data || [];

                // Add "All" category at the beginning
                const categoriesWithAll = [
                    { id: 'all', category_name: 'All' },
                    ...categoriesData
                ];

                setCategories(categoriesWithAll);

                // Initially fetch all products
                fetchProducts('all');
            } catch (error) {
                console.error('Error fetching categories:', error);
                if (error.response?.status !== 401) {
                    toast.error('Failed to load categories');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch products based on category
    const fetchProducts = async (categoryId) => {
        try {
            setProductsLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: '1',
                per_page: '8' // Show 8 featured products
            });

            // Add category filter if not "All"
            if (categoryId !== 'all') {
                params.append('category_id', categoryId);
            }

            const apiUrl = `${ApiUrlServices.ALL_PRODUCT_LIST}?${params}`;
            const res = await AxiosServices.get(apiUrl);

            setProducts(res.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status !== 401) {
                toast.error('Failed to load products');
            }
        } finally {
            setProductsLoading(false);
        }
    };

    const handleCategoryChange = useCallback((categoryId, categoryName) => {
        setActiveFilter(categoryName);
        fetchProducts(categoryId);
    }, []);

    // Handler functions that will be passed to ProductCard
    const handleAddToCart = useCallback(async (product) => {
        const success = await addToCart(product);
        if (success) {
            toast.success("Product added to cart!");
        }
        return success;
    }, [addToCart]);

    const handleRemoveFromCart = useCallback(async (product) => {
        const success = await removeFromCart(product);
        if (success) {
            toast.success("Removed from cart!");
        }
        return success;
    }, [removeFromCart]);

    const handleWishlist = useCallback(async (product) => {
        const result = await toggleWishlist(product);
        return result.success;
    }, [toggleWishlist]);

    return (
        <div className="featured-products">
            <div className="section-header">
                <h2>Featured Products</h2>
                <p>Discover our handpicked selection of premium products</p>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {categories.map(category => (
                    <CustomSubmitButton
                        key={category.id}
                        isLoading={loading && activeFilter === category.category_name}
                        onClick={() => handleCategoryChange(category.id, category.category_name)}
                        type="button"
                        label={category.category_name?.toUpperCase() || 'CATEGORY'}
                        btnClassName={`filter-tab ${activeFilter === category.category_name ? 'active' : ''}`}
                        disabled={loading}
                    />
                ))}
            </div>

            {/* Products Grid */}
            {productsLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="no-products-message">
                    <h3>No products found</h3>
                    <p>Try selecting a different category</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map(product => (
                        <ProductCard
                            key={`featured-${product.id}`}
                            product={product}
                            cartItems={cartItems || []}
                            onAddToCart={handleAddToCart}
                            onRemoveFromCart={handleRemoveFromCart}
                            onWishlist={handleWishlist}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeaturedProducts;