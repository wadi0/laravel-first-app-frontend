import React, {useState} from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import {useNavigate} from 'react-router-dom';
import AxiosServices from '../../components/network/AxiosServices.jsx';
import ApiUrlServices from '../../components/network/ApiUrlServices.jsx';
import CustomFileUpload from "../../components/customfileupload/CustomFileUpload.jsx";
import CustomInput from "../../components/customInput/CustomInput.jsx";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomFileUploadWithPreview from "../../components/customfileupload/CustomFileUpload.jsx";

const AddProduct = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const initialValues = {
        name: '',
        price: '',
        description: '',
        image: null
    };

    const validate = (values) => {
        const errors = {};
        if (!values.name.trim()) errors.name = 'Product name is required';
        if (!values.price.trim()) errors.price = 'Product price is required';
        if (!values.description.trim()) errors.description = 'Description is required';
        if (!values.image) errors.image = 'Image is required';
        return errors;
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('price', values.price);
        formData.append('description', values.description);
        formData.append('image', values.image);

        try {
            const response = await AxiosServices.post(ApiUrlServices.ADD_PRODUCT, formData, true);
            console.log('Product added successfully:', response.data);
            // navigate('/products');
        } catch (error) {
            console.error('Error adding product:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Add Product</h2>
            <Formik
                initialValues={initialValues}
                validate={validate}
                onSubmit={handleSubmit}
            >
                {() => (
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

                            {/*<CustomFileUpload name="image" label="Product Image"/>*/}
                            <CustomFileUploadWithPreview
  name="image"
  label="Product Image"
/>
                            <CustomInput
                                name="description"
                                label="Product description"
                                placeholder="Enter product description"
                            />
                        </div>
                        <CustomSubmitButton
                            isLoading={loading}
                            // onClick={addProductForm}
                            type="submit"
                            label="Submit"
                        />
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddProduct;