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
import {toast} from "react-toastify";
import {useApp} from "../../components/context/AppContext.jsx"; // ✅ Import useApp hook

const SignIn = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // ✅ FIXED: Get updateAuthState from context
    const { updateAuthState } = useApp();

    const initialValues = {
        email: '',
        password: '',
    };

    const validate = (values) => {
        const errors = {};

        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) errors.email = 'Invalid email format';
        if (!values.email.trim()) errors.email = 'Email is required';

        if (values.password.length < 6) errors.password = 'Must be at least 6 characters';
        if (!values.password.trim()) errors.password = 'Password is required';

        return errors;
    };

    // ✅ FIXED: Updated handleSubmit to properly wait for data loading
    const handleSubmit = async (values, {resetForm}) => {
        setLoading(true);
        let payload = {
            email: values.email,
            password: values.password
        }
        try {
            const response = await AxiosServices.post(ApiUrlServices.LOG_IN, payload);
            
            // ✅ Reset form and show success message first
            resetForm();
            toast.success("Sign In Successfully.");
            
            // ✅ Update context state and wait for cart/wishlist data to load
            const userData = response.data.result;
            console.log('Login successful, loading user data...');
            
            // This will automatically load cart and wishlist data
            await updateAuthState(userData);
            
            console.log('User data and cart/wishlist loaded, navigating to home...');
            
            // ✅ Navigate only after all data is loaded
            navigate(path.home);
            
        } catch (error) {
            if (error.response?.data?.msg === "User not found! Please sign up first.") {
                toast.error('User not found! Please sign up first.');
            } else {
                toast.error('Something went wrong');
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
                            <CustomSubmitButton
                                isLoading={loading}
                                type="submit"
                                label="Sign In"
                                btnClassName="dedefault-submit-btn login-btn"
                            />
                        </Form>
                    </Formik>
                    <div className="forgot-pass-signup-link">
                        <p className="forgot-password" style={{cursor: "not-allowed"}}>Forgot your password?</p>
                        <Link to={path.signup} className="signup-link">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;



// import React, {useState} from 'react';
// import "./signin.scss";
// import zawLogo from "../../assets/zawlogo2.jpg";
// import CustomInput from "../../components/customInput/CustomInput.jsx";
// import {Form, Formik} from "formik";
// import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
// import AxiosServices from "../../components/network/AxiosServices.jsx";
// import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
// import {Link, useNavigate} from "react-router-dom";
// import path from "../../routes/path.jsx";
// import {toast} from "react-toastify";
// import {useApp} from "../../components/context/AppContext.jsx"; // ✅ Import useApp hook

// const SignIn = () => {
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
    
//     // ✅ FIXED: Get updateAuthState from context
//     const { updateAuthState } = useApp();

//     const initialValues = {
//         email: '',
//         password: '',
//     };

//     const validate = (values) => {
//         const errors = {};

//         if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) errors.email = 'Invalid email format';
//         if (!values.email.trim()) errors.email = 'Email is required';

//         if (values.password.length < 6) errors.password = 'Must be at least 6 characters';
//         if (!values.password.trim()) errors.password = 'Password is required';

//         return errors;
//     };

//     // ✅ FIXED: Updated handleSubmit with loading state management
//     const handleSubmit = async (values, {resetForm}) => {
//         setLoading(true);
//         let payload = {
//             email: values.email,
//             password: values.password
//         }
//         try {
//             const response = await AxiosServices.post(ApiUrlServices.LOG_IN, payload);
            
//             // ✅ Reset form first
//             resetForm();
//             toast.success("Sign In Successfully.");
            
//             // ✅ IMPORTANT: Update context state and wait for data to load
//             const userData = response.data.result;
//             console.log('Login successful, loading user data...');
            
//             // This will automatically load cart and wishlist data
//             await updateAuthState(userData);
            
//             console.log('User data and cart/wishlist loaded, navigating to home...');
            
//             // ✅ Navigate only after all data is loaded
//             navigate(path.home);
            
//         } catch (error) {
//             if (error.response?.data?.msg === "User not found! Please sign up first.") {
//                 toast.error('User not found! Please sign up first.');
//             } else {
//                 toast.error('Something went wrong');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="signIn_container">
//             <div className="signin-card">
//                 <div className="image">
//                     <img src={zawLogo} className='img'/>
//                 </div>
//                 <div className="signin-content">
//                     <h2 className="signin-title">Sign In your account</h2>
//                     <Formik
//                         initialValues={initialValues}
//                         validate={validate}
//                         onSubmit={handleSubmit}
//                     >
//                         <Form className="signin-form">
//                             <div className="mb-3">
//                                 <CustomInput
//                                     name="email"
//                                     label="Email"
//                                     placeholder="Enter your email"
//                                     labelClassName="signin-label"
//                                     inputClassName="signin-input"
//                                 />
//                             </div>
//                             <div className="mb-3">
//                                 <CustomInput
//                                     name="password"
//                                     label="Password"
//                                     placeholder="Enter your password"
//                                     type="password"
//                                     labelClassName="signin-label"
//                                     inputClassName="signin-input"
//                                 />
//                             </div>
//                             <CustomSubmitButton
//                                 isLoading={loading}
//                                 type="submit"
//                                 label="Sign In"
//                                 btnClassName="dedefault-submit-btn login-btn"
//                             />
//                         </Form>
//                     </Formik>
//                     <div className="forgot-pass-signup-link">
//                         <p className="forgot-password" style={{cursor: "not-allowed"}}>Forgot your password?</p>
//                         <Link to={path.signup} className="signup-link">Sign Up</Link>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SignIn;


// // import React, {useState} from 'react';
// // import "./signin.scss";
// // import zawLogo from "../../assets/zawlogo2.jpg";
// // import CustomInput from "../../components/customInput/CustomInput.jsx";
// // import {Form, Formik} from "formik";
// // import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
// // import AxiosServices from "../../components/network/AxiosServices.jsx";
// // import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
// // import {Link, useNavigate} from "react-router-dom";
// // import path from "../../routes/path.jsx";
// // import {toast} from "react-toastify";

// // const SignIn = () => {

// //     const [loading, setLoading] = useState(false);
// //     const navigate = useNavigate();

// //     const initialValues = {
// //         email: '',
// //         password: '',
// //     };

// //     const validate = (values) => {
// //         const errors = {};

// //         if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) errors.email = 'Invalid email format';
// //         if (!values.email.trim()) errors.email = 'Email is required';

// //         if (values.password.length < 6) errors.password = 'Must be at least 6 characters';
// //         if (!values.password.trim()) errors.password = 'Password is required';

// //         return errors;
// //     };

// //     const handleSubmit = async (values, {resetForm}) => {
// //         setLoading(true);
// //         let payload = {
// //             email: values.email,
// //             password: values.password
// //         }
// //         try {
// //             await AxiosServices.post(ApiUrlServices.LOG_IN, payload)
// //                 .then((res) => {
// //                     localStorage.setItem("user", JSON.stringify(res.data.result));
// //                     resetForm()
// //                     navigate(path.home);
// //                     toast.success("Sign In Successfully.")
// //                 })
// //         } catch (error) {
// //             if (error.response.data.msg === "User not found! Please sign up first.") {
// //                 toast.error('User not found! Please sign up first.');
// //             } else {
// //                 toast.error('Something went wrong');
// //             }
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <div className="signIn_container">
// //             <div className="signin-card">
// //                 <div className="image">
// //                     <img src={zawLogo} className='img'/>
// //                 </div>
// //                 <div className="signin-content">
// //                     <h2 className="signin-title">Sign In your account</h2>
// //                     <Formik
// //                         initialValues={initialValues}
// //                         validate={validate}
// //                         onSubmit={handleSubmit}
// //                     >
// //                         <Form className="signin-form">
// //                             <div className="mb-3">
// //                                 <CustomInput
// //                                     name="email"
// //                                     label="Email"
// //                                     placeholder="Enter your email"
// //                                     labelClassName="signin-label"
// //                                     inputClassName="signin-input"
// //                                 />
// //                             </div>
// //                             <div className="mb-3">
// //                                 <CustomInput
// //                                     name="password"
// //                                     label="Password"
// //                                     placeholder="Enter your password"
// //                                     type="password"
// //                                     labelClassName="signin-label"
// //                                     inputClassName="signin-input"
// //                                 />
// //                             </div>
// //                             <CustomSubmitButton
// //                                 isLoading={loading}
// //                                 type="submit"
// //                                 label="Sign In"
// //                                 btnClassName="dedefault-submit-btn login-btn"
// //                             />
// //                         </Form>
// //                     </Formik>
// //                     <div className="forgot-pass-signup-link">
// //                         <p className="forgot-password" style={{cursor: "not-allowed"}}>Forgot your password?</p>
// //                         <Link to={path.signup} className="signup-link">Sign Up</Link>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default SignIn;