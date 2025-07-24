import React, {useState, useEffect} from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import {useNavigate} from 'react-router-dom';
import AxiosServices from '../../components/network/AxiosServices.jsx';
import ApiUrlServices from '../../components/network/ApiUrlServices.jsx';
import CustomFileUpload from "../../components/customfileupload/CustomFileUpload.jsx";
import CustomInput from "../../components/customInput/CustomInput.jsx";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomFileUploadWithPreview from "../../components/customfileupload/CustomFileUpload.jsx";
import path from "../../routes/path.jsx";

const AddProduct = ({product, onSuccess}) => {
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();

    const initialValues = {
        name: product?.name || '',
        price: product?.price || '',
        description: product?.description || '',
        image: null
    };

    useEffect(() => {
        if (product?.image) {
            setPreviewImage(`http://localhost:8000/storage/${product.image}`);
        }
    }, [product]);

    const validate = (values) => {
        const errors = {};
        if (!values.name.trim()) errors.name = 'Product name is required';
        if (!values.price.trim()) errors.price = 'Product price is required';
        if (!values.description.trim()) errors.description = 'Description is required';
        if (!product && !values.image) errors.image = 'Image is required';
        return errors;
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('price', values.price);
        formData.append('description', values.description);
        if (values.image) {
            formData.append('image', values.image);
        }

        try {
            let response;
            if (product) {
                // Update existing product
                response = await AxiosServices.post(
                    ApiUrlServices.UPDATE_PRODUCT(product.id),
                    formData,
                    true
                );
            } else {
                // Create new product
                response = await AxiosServices.post(
                    ApiUrlServices.ADD_PRODUCT,
                    formData,
                    true
                );
            }

            console.log('Product saved successfully:', response.data);
            if (onSuccess) {
                onSuccess();
            } else {
                navigate(path.home);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (setFieldValue, file) => {
        setFieldValue('image', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    return (
        <div>
            <Formik
                initialValues={initialValues}
                validate={validate}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({setFieldValue}) => (
                    <Form encType="multipart/form-data">
                        <div className="textbox">
                            <CustomInput
                                name="name"
                                label="Product name"
                                placeholder="Enter product name"
                            />
                            <CustomInput
                                name="price"
                                label="Product price"
                                placeholder="Enter product price"
                                type="text"
                            />

                            <div className="form-group">
                                <label>Product Image</label>
                                {previewImage && (
                                    <div className="image-preview">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            style={{maxWidth: '200px', maxHeight: '200px'}}
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={(event) => {
                                        handleImageChange(
                                            setFieldValue,
                                            event.currentTarget.files[0]
                                        );
                                    }}
                                />
                                <ErrorMessage name="image" component="div" className="error-message" />
                            </div>

                            <CustomInput
                                name="description"
                                label="Product description"
                                placeholder="Enter product description"
                                as="textarea"
                            />
                        </div>
                        <CustomSubmitButton
                            isLoading={loading}
                            type="submit"
                            label={product ? "Update Product" : "Add Product"}
                        />
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddProduct;