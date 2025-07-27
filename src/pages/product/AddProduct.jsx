import React, {useState, useEffect} from 'react';
import {Formik, Form, Field, ErrorMessage, FieldArray} from 'formik';
import {useNavigate} from 'react-router-dom';
import AxiosServices from '../../components/network/AxiosServices.jsx';
import ApiUrlServices from '../../components/network/ApiUrlServices.jsx';
import CustomFileUpload from "../../components/customfileupload/CustomFileUpload.jsx";
import CustomInput from "../../components/customInput/CustomInput.jsx";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomFileUploadWithPreview from "../../components/customfileupload/CustomFileUpload.jsx";
import path from "../../routes/path.jsx";
import {FaUpload} from "react-icons/fa";

const AddProduct = ({product, onSuccess}) => {
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();

    const initialValues = {
        name: product?.name || '',
        price: product?.price || '',
        description: product?.description || '',
        role: product?.role || '',
        team: product?.team || '',
        image: null,
        variants: [
            {color: '', size: '', stock: ''}
        ]
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
        formData.append('role', values.role);
        formData.append('team', values.team);
        if (values.image) {
            formData.append('image', values.image);
        }

        values.variants.forEach((variant, index) => {
            formData.append(`variants[${index}][color]`, variant.color);
            formData.append(`variants[${index}][size]`, variant.size);
            formData.append(`variants[${index}][stock]`, variant.stock);
        });

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
                            <div className="mb-3">
                                <CustomInput
                                    name="name"
                                    label="Product name"
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div className="mb-3">
                                <CustomInput
                                    name="price"
                                    label="Product price"
                                    placeholder="Enter product price"
                                />
                            </div>
                            <div className="mb-3">
                                <CustomInput
                                    name="team"
                                    label="Team name"
                                    placeholder="Enter team name"
                                />
                            </div>
                            {/* select tag use role ok*/}
                            <div className="mb-3">
                                <CustomInput
                                    name="role"
                                    label="Role"
                                    placeholder="Enter product role"
                                />
                            </div>

                            <div className=" mb-3 mt-3">
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

                                <label htmlFor="image-upload" style={{cursor: 'pointer', display: 'inline-block'}}>
                                    <FaUpload size={24} color="#007bff"/>
                                    <span style={{marginLeft: '8px'}}>Upload Image</span>
                                </label>

                                <input
                                    id="image-upload"
                                    type="file"
                                    style={{display: 'none'}}
                                    onChange={(event) => {
                                        handleImageChange(setFieldValue, event.currentTarget.files[0]);
                                    }}
                                />

                                <ErrorMessage name="image" component="div" className="error-message"/>
                            </div>


                            <div className="mb-3">
                                <CustomInput
                                    name="description"
                                    label="Product description"
                                    placeholder="Enter product description"
                                    as="textarea"
                                />
                            </div>

                            <hr/>
                            <FieldArray name="variants">
                                {({push, remove, form}) => (
                                    <>
                                        {form.values.variants.map((variant, index) => {
                                            const isFirst = index === 0;
                                            const suffix = isFirst ? '' : ` ${index}`;
                                            return (
                                                <div key={index} className="variant-group">
                                                    {/*style={{*/}
                                                    {/*    marginBottom: '1.5rem',*/}
                                                    {/*    border: '1px solid #ddd',*/}
                                                    {/*    padding: '1rem',*/}
                                                    {/*    borderRadius: '6px',*/}
                                                    {/*    position: 'relative'*/}
                                                    {/*}}*/}

                                                    {/* Header row with title and buttons */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <h5 style={{margin: 0}}>Product
                                                            Variant {isFirst ? '' : index}</h5>
                                                        <div>
                                                            {form.values.variants.length > 1 && (
                                                                <CustomSubmitButton
                                                                    isLoading={loading}
                                                                    type="button"
                                                                    label="❌ Remove"
                                                                    onClick={() => remove(index)}
                                                                />
                                                            )}
                                                            <CustomSubmitButton
                                                                isLoading={loading}
                                                                type="button"
                                                                label="+ Add Variant"
                                                                onClick={() => push({color: '', size: '', stock: ''})}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Inputs */}
                                                    <div style={{marginTop: '1rem'}}>
                                                        <div className="mb-3">
                                                            <CustomInput
                                                                name={`variants[${index}].color`}
                                                                label={`Color${suffix}`}
                                                                placeholder="Enter color"
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <CustomInput
                                                                name={`variants[${index}].size`}
                                                                label={`Size${suffix}`}
                                                                placeholder="Enter size"
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <CustomInput
                                                                name={`variants[${index}].stock`}
                                                                label={`Stock${suffix}`}
                                                                placeholder="Enter stock"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </FieldArray>
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