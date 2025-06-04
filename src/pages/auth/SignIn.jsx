import React, {useState} from 'react';
import "./signin.scss";
import flower_pic from "../../assets/feature-pic.png";
import logo from "../../assets/logo.png";
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

        // if (!values.country) errors.country = "Country is required";

        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) errors.email = 'Invalid email format';
        if (!values.email.trim()) errors.email = 'Email is required';

        if (values.password.length < 6) errors.password = 'Must be at least 6 characters';
        if (!values.password.trim()) errors.password = 'Password is required';

        return errors;
    };

    const handleSubmit = async (values, {resetForm}) => {
        setLoading(true);
        let payload = {
            email : values.email,
            password : values.password
        }
        try {
            await AxiosServices.post(ApiUrlServices.LOG_IN, payload)
                .then((res)=>{
                    localStorage.setItem("token", res.data.result.token);
                    console.log(res)
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
            <div className="card">
                <div className="image">
                    <img src={flower_pic}/>
                </div>
                <div className="content">
                    <img src={logo}/>
                    <h2>Sign In your account</h2>
                    <Formik
                        initialValues={initialValues}
                        validate={validate}
                        onSubmit={handleSubmit}
                    >
                        <Form className="form">
                            <div className="textbox">
                                <CustomInput
                                    name="email"
                                    label="Email"
                                    placeholder="Enter your email"
                                />
                                <CustomInput
                                    name="password"
                                    label="Password"
                                    placeholder="Enter your password"
                                    type="password"
                                />
                                {/*<CustomSelect*/}
                                {/*    name="country"*/}
                                {/*    label="Select Country"*/}
                                {/*    placeholder="Please select your country"*/}
                                {/*    options={optionsCountry.map((item) => ({*/}
                                {/*        label: item.label.toUpperCase(),*/}
                                {/*        value: item.value,*/}
                                {/*    }))}*/}
                                {/*/>*/}

                            </div>
                            <CustomSubmitButton
                                isLoading={loading}
                                // onClick={handleSubmit}
                                type="submit"
                                label="Login"
                            />
                        </Form>
                    </Formik>
                    <p>Already have an account?</p>
                    <Link to={path.signup}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignIn;