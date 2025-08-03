import React, { useEffect, useState } from 'react';
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import "./product.scss";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomModal from "../../components/custommodal/CustomModal.jsx";
import AddProduct from "./AddProduct.jsx";
import CustomSelect from "../../components/customselect/CustomSelect.jsx";
import ProductCard from "./ProductCard.jsx";

const Product = () => {
    const [productList, setProductList] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        getAllProductList();
    }, []);

    useEffect(() => {
        if (selectedCategory === '') {
            setFilteredProducts(productList);
        } else {
            const filtered = productList.filter(product =>
                product.category_id === parseInt(selectedCategory)
            );
            setFilteredProducts(filtered);
        }
    }, [selectedCategory, productList]);

    const getAllProductList = async () => {
        setLoading(true);
        try {
            const res = await AxiosServices.get(ApiUrlServices.ALL_PRODUCT_LIST);
            setProductList(res.data.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await AxiosServices.delete(ApiUrlServices.DELETE_PRODUCT(id));
            getAllProductList();
            alert("Product deleted successfully!");
        } catch (err) {
            console.error('Error deleting product:', err);
            alert("Error deleting product. Please try again.");
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const categoryOptions = [
        { label: 'All Categories', value: '' },
        ...categoryList.map((item) => ({
            label: item.name.toUpperCase(),
            value: item.id,
        }))
    ];

    return (
        <div className="product-wrapper">
            <div className="top-bar">
                <CustomSelect
                    id="category-filter-select"
                    name="category_id"
                    label="Filter by Category"
                    placeholder="Please select category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                    disabled={false}
                />

                <CustomSubmitButton
                    isLoading={loading}
                    onClick={toggleModal}
                    type="button"
                    label="+ Add Product"
                    btnClassName="default-submit-btn"
                />
            </div>

            {loading ? (
                <div className="loading-container">
                    <p>Loading products...</p>
                </div>
            ) : (
                <div className="product-container">
                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <p>No products found.</p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEdit}
                                onDelete={deleteProduct}
                            />
                        ))
                    )}
                </div>
            )}

            <CustomModal
                isOpen={showModal}
                onClose={toggleModal}
                title={editingProduct !== null ? "Update Product" : "Add New Product"}
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
