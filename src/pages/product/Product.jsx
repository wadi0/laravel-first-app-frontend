import React, {useEffect, useState} from 'react';
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import "./product.scss";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomModal from "../../components/custommodal/CustomModal.jsx";
import AddProduct from "./AddProduct.jsx";

const Product = () => {

    const [productList, setProductList] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    useEffect(() => {
        gelAllProductList()
    }, []);

    const gelAllProductList = async () => {
        await AxiosServices.get(ApiUrlServices.ALL_PRODUCT_LIST)
            .then((res) => {
                console.log(res.data.data)
                setProductList(res.data.data)
            }).catch((err) => {
                console.log(err)
            }).finally(() => {

            })
    }

    const deleteProduct = async (id) => {
        await AxiosServices.delete(ApiUrlServices.DELETE_PRODUCT(id))
            .then((res) => {
                gelAllProductList()
                alert("Product deleted successfully!");
            }).catch((err) => {
                console.log(err)
            }).finally(() => {

            })
    }

    const UpdateProduct = async (id) => {
        await AxiosServices.post(ApiUrlServices.UPDATE_PRODUCT(id))
            .then((res) => {
                gelAllProductList()
                alert("Product Updated successfully!");
            }).catch((err) => {
                console.log(err)
            }).finally(() => {

            })
    }

    const handleEdit = (product) => {
        setEditingProduct(product);
        // setModalTitle("Edit Product");
        setShowModal(true);
    };

    return (

        <div className="product-wrapper">
            <div className="top-bar">
                <CustomSubmitButton
                    // isLoading={loading}
                    onClick={toggleModal}
                    type="button"
                    label="+ Add Product"
                    btnClassName="default-submit-btn"
                />
            </div>

            <div className="product-container">
                {productList.map((product) => (
                    <div key={product.id} className="product">
                        <img
                            src={`http://localhost:8000/storage/${product.image}`}
                            alt={product.name}
                            className="product-img"
                        />
                        <h3 className="product-name">{product.name}</h3>
                        <h3 className="product-name">{product.description}</h3>
                        <h3 className="product-name">${product.price}</h3>
                        <CustomSubmitButton
                                onClick={() => handleEdit(product)}
                                type="button"
                                label="Edit"
                                btnClassName="edit-btn"
                            />
                        <CustomSubmitButton
                            // isLoading={loading}
                            onClick={()=> deleteProduct(product.id)}
                            type="submit"
                            label="Delete"
                        />
                    </div>
                ))}
            </div>

            <CustomModal
                isOpen={showModal}
                onClose={toggleModal}
                title={editingProduct !== null ? "Update Product" : "Add New Product"}
                // modalClass="your-custom-class-if-needed"
                // size="700px"
            >
                <AddProduct
                    product={editingProduct}
                    onSuccess={() => {
                        gelAllProductList();
                        toggleModal();
                    }}
                />
            </CustomModal>
        </div>
    )
};

export default Product;
