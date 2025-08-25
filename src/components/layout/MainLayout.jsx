import React from 'react';
import {Outlet} from 'react-router-dom';
import Navbar from '../navbar/Navbar.jsx';
import Footer from "../footer/Footer.jsx";

const MainLayout = () => {
    return (
        <>
            <Navbar/>
            <div className="main-layout">
                <main className="main-content">
                    <Outlet/>
                </main>
                <Footer/>
            </div>
        </>
    );
};

export default MainLayout;