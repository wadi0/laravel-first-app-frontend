import {Routes, Route} from 'react-router-dom';
import './App.css'
import AuthLayout from "./components/layout/AuthLayout.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import path from "./routes/path.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import Home from "./pages/home/Home.jsx";
import Product from "./pages/product/Product.jsx";
import Cart from "./pages/cart/Cart.jsx";
import Wishlist from "./pages/wishlist/Wishlist.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import ErrorBoundary from "./components/errorBoundary/ErrorBoundary.jsx";
import {AppProvider} from "./components/context/AppContext.jsx";
import Checkout from "./pages/checkout/Checkout.jsx";
import OrderSuccess from "./pages/order/OrderSuccess.jsx";
import Orders from "./pages/order/Order.jsx";
import OrderDetails from "./pages/order/OrderDetails.jsx";
import TrackOrder from "./pages/order/TrackOrder.jsx";

function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <Routes>
                    {/* Auth Pages - শুধুমাত্র non-authenticated users */}
                    <Route element={<PublicRoute/>}>
                        <Route element={<AuthLayout/>}>
                            <Route path={path.login} element={<SignIn/>}/>
                            <Route path={path.signup} element={<SignUp/>}/>
                        </Route>
                    </Route>

                    {/* Main App - All users can access these */}
                    <Route element={<MainLayout/>}>
                        <Route path={path.home} element={<Home/>}/>
                        <Route path={path.product} element={<Product/>}/>

                        {/* Protected routes within main layout */}
                        <Route element={<PrivateRoute/>}>
                            <Route path={path.cart} element={<Cart/>}/>
                            <Route path={path.wishlist} element={
                                <ErrorBoundary>
                                    <Wishlist/>
                                </ErrorBoundary>
                            }/>
                            <Route path={path.checkout} element={<Checkout/>}/>
                            <Route path={path.order_success_route} element={<OrderSuccess/>}/>
                            <Route path={path.orders} element={<Orders/>}/>
                                                        <Route path={path.order_details_route} element={<OrderDetails/>}/>
                                                        <Route path={path.track_order_route} element={<TrackOrder/>}/>
                        </Route>
                    </Route>
                </Routes>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;


// import {Routes, Route} from 'react-router-dom';
// import './App.css'
// import AuthLayout from "./components/layout/AuthLayout.jsx";
// import SignUp from "./pages/auth/SignUp.jsx";
// import SignIn from "./pages/auth/SignIn.jsx";
// import path from "./routes/path.jsx";
// import MainLayout from "./components/layout/MainLayout.jsx";
// import Home from "./pages/home/Home.jsx";
// import Product from "./pages/product/Product.jsx";
// import Cart from "./pages/cart/Cart.jsx";
// import Wishlist from "./pages/wishlist/Wishlist.jsx";
// import PrivateRoute from "./routes/PrivateRoute.jsx";
// import PublicRoute from "./routes/PublicRoute.jsx";
// import ErrorBoundary from "./components/errorBoundary/ErrorBoundary.jsx";
// import {AppProvider} from "./components/context/AppContext.jsx";
//
// function App() {
//     return (
//         <ErrorBoundary>
//             <AppProvider>
//                 <Routes>
//                     <Route element={<PublicRoute/>}>
//                         <Route element={<AuthLayout/>}>
//                             <Route path={path.login} element={<SignIn/>}/>
//                             <Route path={path.signup} element={<SignUp/>}/>
//                             <Route path={path.home} element={<Home/>}/>
//                             <Route path={path.product} element={<Product/>}/>
//                         </Route>
//                     </Route>
//
//                     <Route element={<PrivateRoute/>}>
//                         <Route element={<MainLayout/>}>
//                             <Route path={path.cart} element={<Cart/>}/>
//                             <Route path={path.wishlist} element={
//                                 <ErrorBoundary>
//                                     <Wishlist/>
//                                 </ErrorBoundary>
//                             }/>
//                         </Route>
//                     </Route>
//                 </Routes>
//             </AppProvider>
//         </ErrorBoundary>
//     );
// }
//
// export default App;


// import {Routes, Route} from 'react-router-dom';
// import './App.css'
// import AuthLayout from "./components/layout/AuthLayout.jsx";
// import SignUp from "./pages/auth/SignUp.jsx";
// import SignIn from "./pages/auth/SignIn.jsx";
// import path from "./routes/path.jsx";
// import MainLayout from "./components/layout/MainLayout.jsx";
// import Home from "./pages/home/Home.jsx";
// import Product from "./pages/product/Product.jsx";
// import PrivateRoute from "./routes/PrivateRoute.jsx";
// import PublicRoute from "./routes/PublicRoute.jsx";
// import {AppProvider} from "./components/context/AppContext.jsx";
// import Cart from "./pages/cart/Cart.jsx";
// import Wishlist from "./pages/wishlist/Wishlist.jsx";
//
// function App() {
//     return (
//         <AppProvider> {/* সব কিছু AppProvider দিয়ে wrap করুন */}
//             <Routes>
//                 <Route element={<PublicRoute/>}>
//                     <Route element={<AuthLayout/>}>
//                         <Route path={path.login} element={<SignIn/>}/>
//                         <Route path={path.signup} element={<SignUp/>}/>
//                     </Route>
//                 </Route>
//
//                 <Route element={<PrivateRoute/>}>
//                     <Route element={<MainLayout/>}>
//                         <Route path={path.home} element={<Home/>}/>
//                         <Route path={path.product} element={<Product/>}/>
//                         <Route path={path.cart} element={<Cart/>}/>
//                         <Route path={path.wishlist} element={<Wishlist/>}/>
//                     </Route>
//                 </Route>
//             </Routes>
//         </AppProvider>
//     );
// }
//
// export default App;