import React, {useState} from 'react';
import "./signin.scss";
import zawLogo from "../../assets/zawLogo.jpg";
import CustomInput from "../../components/customInput/CustomInput.jsx";
import {Form, Formik} from "formik";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import {Link, useNavigate} from "react-router-dom";
import path from "../../routes/path.jsx";
import {toast} from "react-toastify";

const SignUp = () => {

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const initialValues = {
        name: '',
        email: '',
        password: '',
    };

    const validate = (values) => {
        const errors = {};

        if (!values.name) errors.name = "Name is required";

        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) errors.email = 'Invalid email format';
        if (!values.email.trim()) errors.email = 'Email is required';

        if (values.password.length < 6) errors.password = 'Must be at least 6 characters';
        if (!values.password.trim()) errors.password = 'Password is required';

        return errors;
    };

    const handleSubmit = async (values, {resetForm}) => {
        setLoading(true);
        let payload = {
            name: values.name,
            email: values.email,
            password: values.password
        }
        try {
            await AxiosServices.post(ApiUrlServices.SIGN_UP, payload)
                .then((res) => {
                    resetForm();
                    navigate(path.login);
                    toast.success("Sign Up Successfully.")
                })
        } catch (error) {
            const emailError = error?.response?.data?.msg?.email;
            if (emailError?.length) {
                toast.error(emailError[0]);
            } else {
                toast.error("Something went wrong.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signIn_container">
            <div className="signin-card">
                <div className="image">
                    <img src={zawLogo} className='img'/>
                </div>
                <div className="signin-content">
                    <h2 className="signin-title">Sign Up your account</h2>
                    <Formik
                        initialValues={initialValues}
                        validate={validate}
                        onSubmit={handleSubmit}
                    >
                        <Form className="signin-form">
                            <div className="mb-3">
                                <CustomInput
                                    name="name"
                                    label="Name"
                                    placeholder="Enter your name"
                                    labelClassName="signin-label"
                                    inputClassName="signin-input"
                                />
                            </div>
                            <div className="mb-3">
                                <CustomInput
                                    name="email"
                                    label="Email"
                                    placeholder="Enter your email"
                                    labelClassName="signin-label"
                                    inputClassName="signin-input"
                                />
                            </div>
                            <div className="mb-3">
                                <CustomInput
                                    name="password"
                                    label="Password"
                                    placeholder="Enter your password"
                                    type="password"
                                    labelClassName="signin-label"
                                    inputClassName="signin-input"
                                />
                            </div>
                            <CustomSubmitButton
                                isLoading={loading}
                                // onClick={handleSubmit}
                                type="submit"
                                label="Sign Up"
                                btnClassName="signin-btn"
                            />
                        </Form>
                    </Formik>
                    <div className="forgot-pass-signup-link">
                        <p className="already-account">Already have an account?</p>
                        <Link to={path.login} className="signup-link">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;