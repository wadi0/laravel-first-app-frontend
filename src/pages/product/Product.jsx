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

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    useEffect(() => {
        gelAllProductList()
    }, []);

    const gelAllProductList = async () => {
        await AxiosServices.get(ApiUrlServices.ALL_PRODUCT_LIST)
            .then((res) => {
                console.log(res.data)
                setProductList(res.data)
            }).catch((err) => {
                console.log(err)
            }).finally(() => {

            })
    }

    return (

        <div className="product-wrapper">
            <div className="top-bar">
                <CustomSubmitButton
                    // isLoading={loading}
                    onClick={toggleModal}
                    type="submit"
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
                    </div>
                ))}
            </div>

            <CustomModal
                isOpen={showModal}
                onClose={toggleModal}
                title="Add New Product"
                // modalClass="your-custom-class-if-needed"
                // size="700px"
            >
                <AddProduct/>
            </CustomModal>
        </div>
    )
};

export default Product;
