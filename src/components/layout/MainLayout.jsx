// MainLayout.jsx - এইটা ব্যবহার করো
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar.jsx';

const MainLayout = () => {
  return (
    <>
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="main-layout">
        <main className="main-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© 2025 Wadi</p>
        </footer>
      </div>
    </>
  );
};

export default MainLayout;