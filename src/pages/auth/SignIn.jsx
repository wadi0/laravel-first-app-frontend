import React, {useState} from 'react';
import "./signin.scss";
import zawLogo from "../../assets/zawlogo2.jpg";
import CustomInput from "../../components/customInput/CustomInput.jsx";
import {Form, Formik} from "formik";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import {Link, useNavigate} from "react-router-dom";
import path from "../../routes/path.jsx";

const SignIn = () => {

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // const optionsCountry = [
    //     {label: "Bangladesh", value: "bd"},
    //     {label: "India", value: "in"},
    //     {label: "USA", value: "us"},
    // ];

    const initialValues = {
        email: '',
        password: '',
        // country: "",
    };

    const validate = (values) => {
        const errors = {};

        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) errors.email = 'Invalid email format';
        if (!values.email.trim()) errors.email = 'Email is required';

        if (values.password.length < 6) errors.password = 'Must be at least 6 characters';
        if (!values.password.trim()) errors.password = 'Password is required';

        return errors;
    };

    const handleSubmit = async (values, {resetForm}) => {
        setLoading(true);
        let payload = {
            email: values.email,
            password: values.password
        }
        try {
            await AxiosServices.post(ApiUrlServices.LOG_IN, payload)
                .then((res) => {
                    localStorage.setItem("user", JSON.stringify(res.data.result));
                    navigate(path.home);
                })
        } catch (error) {
            alert('Something went wrong');
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
                    <h2 className="signin-title">Sign In your account</h2>
                    <Formik
                        initialValues={initialValues}
                        validate={validate}
                        onSubmit={handleSubmit}
                    >
                        <Form className="signin-form">
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
                            {/*<CustomSelect*/}
                            {/*    name="country"*/}
                            {/*    label="Select Country"*/}
                            {/*    placeholder="Please select your country"*/}
                            {/*    options={optionsCountry.map((item) => ({*/}
                            {/*        label: item.label.toUpperCase(),*/}
                            {/*        value: item.value,*/}
                            {/*    }))}*/}
                            {/*/>*/}


                            <CustomSubmitButton
                                isLoading={loading}
                                // onClick={handleSubmit}
                                type="submit"
                                label="Login"
                                btnClassName="login-btn"
                            />
                        </Form>
                    </Formik>
                    <div className="forgot-pass-signup-link">
                        <p className="forgot-password" style={{ cursor: "not-allowed" }}>Forgot your password?</p>
                        <Link to={path.signup} className="signup-link">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;