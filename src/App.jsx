import {Routes, Route} from 'react-router-dom';
import './App.css'
import AuthLayout from "./components/layout/AuthLayout.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import path from "./routes/path.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import Home from "./pages/home/Home.jsx";
import Product from "./pages/product/Product.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

function App() {
    return (
        <Routes>
            <Route element={<PublicRoute/>}>
                <Route element={<AuthLayout/>}>
                    <Route path={path.login} element={<SignIn/>}/>
                    <Route path={path.signup} element={<SignUp/>}/>
                </Route>
            </Route>

            <Route element={<PrivateRoute/>}>
                <Route element={<MainLayout/>}>
                    <Route path={path.home} element={<Home/>}/>
                    <Route path={path.product} element={<Product/>}/>
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
